import argparse, os, sys, glob
import openai
from dotenv import load_dotenv
import PIL
import torch
import numpy as np
from omegaconf import OmegaConf
from PIL import Image
from tqdm import tqdm, trange
from itertools import islice
from einops import rearrange, repeat
from torchvision.utils import make_grid
from torch import autocast
from contextlib import nullcontext
import time
from pytorch_lightning import seed_everything
from torchvision import transforms

from ldm.util import instantiate_from_config
from ldm.models.diffusion.ddim import DDIMSampler
from ldm.models.diffusion.plms import PLMSSampler

# LLM 관련 설정
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

# img2img 관련 설정 및 이미지 생성 코드
def load_model_from_config(config, ckpt, verbose=False):
    print(f"Loading model from {ckpt}")
    pl_sd = torch.load(ckpt, map_location="cpu")
    if "global_step" in pl_sd:
        print(f"Global Step: {pl_sd['global_step']}")
    sd = pl_sd["state_dict"]
    model = instantiate_from_config(config.model)
    m, u = model.load_state_dict(sd, strict=False)
    if len(m) > 0 and verbose:
        print("missing keys:")
        print(m)
    if len(u) > 0 and verbose:
        print("unexpected keys:")
        print(u)

    model.cuda()
    model.eval()
    return model

def load_img(path):
    image = Image.open(path).convert("RGB")
    w, h = image.size
    print(f"loaded input image of size ({w}, {h}) from {path}")
    w, h = map(lambda x: x - x % 32, (w, h))  # resize to integer multiple of 32
    image = image.resize((w, h), resample=PIL.Image.LANCZOS)
    image = np.array(image).astype(np.float32) / 255.0
    image = image[None].transpose(0, 3, 1, 2)
    image = torch.from_numpy(image)
    return 2.*image - 1.

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--prompt",
        type=str,
        nargs="?",
        default="a cafe-like room",
        help="the prompt to render"
    )
    parser.add_argument(
        "--negative_prompt",
        type=str,
        nargs="?",
        default="Drawings and writing and Picture Style and Low Quality Level",
        help="negative prompt to exclude specific styles or elements",
    )

    parser.add_argument(
        "--init-img",
        type=str,
        nargs="?",
        help="path to the input image"
    )

    parser.add_argument(
        "--outdir",
        type=str,
        nargs="?",
        help="dir to write results to",
        default="outputs/img2img-samples"
    )

    parser.add_argument(
        "--skip_grid",
        action='store_true',
        help="do not save a grid, only individual samples. Helpful when evaluating lots of samples",
        default=True #그리드 생략
    )

    parser.add_argument(
        "--skip_save",
        action='store_true',
        help="do not save individual samples. For speed measurements.",
    )

    parser.add_argument(
        "--ddim_steps",
        type=int,
        default=50,
        help="number of ddim sampling steps",
    )

    parser.add_argument(
        "--plms",
        action='store_true',
        help="use plms sampling",
    )
    parser.add_argument(
        "--fixed_code",
        action='store_true',
        help="if enabled, uses the same starting code across all samples ",
    )

    parser.add_argument(
        "--ddim_eta",
        type=float,
        default=0.0,
        help="ddim eta (eta=0.0 corresponds to deterministic sampling",
    )
    parser.add_argument(
        "--n_iter",
        type=int,
        default=1,
        help="sample this often",
    )
    parser.add_argument(
        "--C",
        type=int,
        default=4,
        help="latent channels",
    )
    parser.add_argument(
        "--f",
        type=int,
        default=8,
        help="downsampling factor, most often 8 or 16",
    )
    parser.add_argument(
        "--n_samples",
        type=int,
        default=3, #기본 생성하는 이미지의 장수
        help="how many samples to produce for each given prompt. A.k.a batch size",
    )
    parser.add_argument(
        "--n_rows",
        type=int,
        default=0,
        help="rows in the grid (default: n_samples)",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=5.0,
        help="unconditional guidance scale: eps = eps(x, empty) + scale * (eps(x, cond) - eps(x, empty))",
    )

    parser.add_argument(
        "--strength",
        type=float,
        default=0.75,
        help="strength for noising/unnoising. 1.0 corresponds to full destruction of information in init image",
    )
    parser.add_argument(
        "--from-file",
        type=str,
        help="if specified, load prompts from this file",
    )
    parser.add_argument(
        "--config",
        type=str,
        default="D:/RoomGenius/AI/configs/stable-diffusion/v1-inference.yaml",
        help="path to config which constructs model",
    )
    parser.add_argument(
        "--ckpt",
        type=str,
        default="D:/RoomGenius/AI/models/ldm/stable-diffusion-v1/model.ckpt",
        help="path to checkpoint of model",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="the seed (for reproducible sampling)",
    )
    parser.add_argument(
        "--precision",
        type=str,
        help="evaluate at this precision",
        choices=["full", "autocast"],
        default="autocast"
    )
    parser.add_argument("--analyze-only", action="store_true", help="Only analyze the prompt without generating images")
    parser.add_argument("--num-inference-steps", type=int, default=50, help="Number of inference steps")

    opt = parser.parse_args()

    def translate_to_english(prompt):
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "Translate the following text to English, regardless of its original language."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.2,
        )
        return response['choices'][0]['message']['content'].strip()

    # 프롬프트를 분석하는 함수
    def analyze_prompt(prompt):
        # 방과 인테리어와 관련된 키워드 목록을 정의합니다.
        relevant_keywords = ["room", "interior", "furniture", "home", "design", "atmosphere","landscape"]

        # 프롬프트가 특정 키워드를 포함하고 있는지 먼저 확인합니다.
        if any(keyword in prompt.lower() for keyword in relevant_keywords):
            return True

        # 키워드가 없을 경우, OpenAI API를 통해 분석을 수행합니다.
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "You are an assistant that analyzes if a prompt is requesting interior design, furniture, or room-related images."},
                {"role": "user",
                 "content": f"Is the following text asking for a furniture, interior design, or room image generation request? Answer with 'Yes' or 'No': {prompt}"}
            ],
            max_tokens=10,
            temperature=0
        )

        result = response['choices'][0]['message']['content'].strip()

        if result.lower() == "yes":
            return True
        else:
            return False


    # 번역된 프롬프트 생성
    prompt_in_english = translate_to_english(opt.prompt)
    negative_prompt_in_english = translate_to_english(opt.negative_prompt)
    print(f"Translated prompt: {prompt_in_english}")
    print(f"Translated negative prompt: {negative_prompt_in_english}")

    # Analyze-only 모드 처리
    if opt.analyze_only:
        if not analyze_prompt(prompt_in_english):
            print("This image cannot be generated")
            exit(1)  # 분석 실패 시 종료
        else:
            print("Prompt is suitable for image generation")
            exit(0)

    # 2. 이미지 생성 절차 시작
    seed_everything(opt.seed)
    config = OmegaConf.load(f"{opt.config}")
    model = load_model_from_config(config, f"{opt.ckpt}")

    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    model = model.to(device)

    if opt.plms:
        raise NotImplementedError("PLMS sampler not (yet) supported")
        sampler = PLMSSampler(model)
    else:
        sampler = DDIMSampler(model)

    os.makedirs(opt.outdir, exist_ok=True)
    outpath = opt.outdir

    batch_size = opt.n_samples
    n_rows = opt.n_rows if opt.n_rows > 0 else batch_size
    if not opt.from_file:
        prompt = opt.prompt
        assert prompt is not None
        data = [batch_size * [prompt]]

    else:
        print(f"reading prompts from {opt.from_file}")
        with open(opt.from_file, "r") as f:
            data = f.read().splitlines()
            data = list(chunk(data, batch_size))

    sample_path = os.path.join(outpath)
    os.makedirs(sample_path, exist_ok=True)
    base_count = len(os.listdir(sample_path))

    grid_count = len(os.listdir(outpath)) - 1

    assert os.path.isfile(opt.init_img)
    init_image = load_img(opt.init_img).to(device)
    init_image = repeat(init_image, '1 ... -> b ...', b=batch_size)
    init_latent = model.get_first_stage_encoding(model.encode_first_stage(init_image))  # move to latent space

    sampler.make_schedule(ddim_num_steps=opt.ddim_steps, ddim_eta=opt.ddim_eta, verbose=False)

    assert 0. <= opt.strength <= 1., 'can only work with strength in [0.0, 1.0]'
    t_enc = int(opt.strength * opt.ddim_steps)
    print(f"target t_enc is {t_enc} steps")

    precision_scope = autocast if opt.precision == "autocast" else nullcontext
    with torch.no_grad():
        with precision_scope("cuda"):
            with model.ema_scope():
                tic = time.time()
                all_samples = list()
                for n in trange(opt.n_iter, desc="Sampling"):
                    for prompts in tqdm(data, desc="data"):
                        uc = None
                        if opt.scale != 1.0:
                            # Negative prompt 적용
                            uc = model.get_learned_conditioning(batch_size * [negative_prompt_in_english])
                        if isinstance(prompts, tuple):
                            prompts = list(prompts)
                        c = model.get_learned_conditioning(prompts)

                        # encode (scaled latent)
                        z_enc = sampler.stochastic_encode(init_latent, torch.tensor([t_enc]*batch_size).to(device))
                        # decode it
                        samples = sampler.decode(
                            z_enc, c, t_enc,
                            unconditional_guidance_scale=opt.scale,
                            unconditional_conditioning=uc,
                        )

                        x_samples = model.decode_first_stage(samples)
                        x_samples = torch.clamp((x_samples + 1.0) / 2.0, min=0.0, max=1.0)
                        '''
                        if not opt.skip_save:
                            for x_sample in x_samples:
                                x_sample = 255. * rearrange(x_sample.cpu().numpy(), 'c h w -> h w c')
                                Image.fromarray(x_sample.astype(np.uint8)).save(
                                    os.path.join(sample_path, f"{base_count:05}.png"))
                                base_count += 1
                        all_samples.append(x_samples)
                        '''
                        fixedImageNames = ['00000.png', '00001.png', '00002.png']  # 고정된 파일 이름

                        if not opt.skip_save:
                            for index, x_sample in enumerate(x_samples[:3]):  # 최대 3개의 이미지만 저장
                                x_sample = 255. * rearrange(x_sample.cpu().numpy(), 'c h w -> h w c')
                                output_path = os.path.join(sample_path, fixedImageNames[index])  # 고정된 파일 이름으로 저장
                                Image.fromarray(x_sample.astype(np.uint8)).save(output_path)

                if not opt.skip_grid:
                    # additionally, save as grid
                    grid = torch.stack(all_samples, 0)
                    grid = rearrange(grid, 'n b c h w -> (n b) c h w')
                    grid = make_grid(grid, nrow=n_rows)

                    # to image
                    grid = 255. * rearrange(grid, 'c h w -> h w c').cpu().numpy()
                    Image.fromarray(grid.astype(np.uint8)).save(os.path.join(outpath, f'grid-{grid_count:05}.png'))
                    grid_count += 1

                toc = time.time()

    print(f"Your samples are ready and waiting for you here: \n{outpath} \n"
          f" \nEnjoy.")


if __name__ == "__main__":
    main()

"""
import torch
from diffusers import AutoPipelineForImage2Image
from diffusers.utils import load_image
import os
import argparse
import openai
from dotenv import load_dotenv

# CUDA 사용 가능 여부 확인
# print(torch.cuda.is_available())

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# Load environment variables for OpenAI API
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

# 명령줄 인자 설정
parser = argparse.ArgumentParser(description="Generate images based on an input image and prompt.")
parser.add_argument("--prompt", type=str, required=True, help="Text prompt for the image generation")
parser.add_argument("--init-img", type=str, required=False, help="Path to the initial input image")
parser.add_argument("--strength", type=float, default=0.7, help="Strength of the transformation (0.0 to 1.0)")
parser.add_argument("--guidance-scale", type=float, default=15.0, help="Guidance scale for prompt adherence")
parser.add_argument("--num-inference-steps", type=int, default=300, help="Number of inference steps")
parser.add_argument("--outdir", type=str, default="C:/Users/MMClab/RoomGenius/backend/output_images/samples", help="The output directory for images")
parser.add_argument("--analyze-only", action="store_true", help="Only analyze the prompt without generating images")
args = parser.parse_args()

# 프롬프트 번역 함수
def translate_to_english(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Translate the following text to English, regardless of its original language."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        temperature=0.2,
    )
    return response['choices'][0]['message']['content'].strip()
# 프롬프트를 분석하는 함수
def analyze_prompt(prompt):
    relevant_keywords = ["room", "interior", "furniture", "home", "design", "atmosphere"]
    if any(keyword in prompt.lower() for keyword in relevant_keywords):
        return True

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an assistant that only analyzes if a prompt explicitly asks for generating an image related to interior design, furniture, or room-related topics. Do not include historical or general questions."},
            {"role": "user", "content": f"Does the following text explicitly ask for generating an image related to furniture, interior design, or room-related topics? Answer with 'Yes' or 'No': {prompt}"}
        ],
        max_tokens=10,
        temperature=0
    )
    result = response['choices'][0]['message']['content'].strip()
    return result.lower() == "yes"

# 프롬프트 분석 모드일 경우 init-img가 필수가 아님
if not args.analyze_only and not args.init_img:
    parser.error("--init-img is required unless --analyze-only is specified")

# 번역된 프롬프트 생성
prompt_in_english = translate_to_english(args.prompt)
print(f"Translated prompt: {prompt_in_english}")

# 프롬프트 분석 (적절하지 않으면 중지)
if args.analyze_only:
    if not analyze_prompt(prompt_in_english):
        print("This image cannot be generated")
        exit(0)
    else:
        print("Prompt is suitable for image generation")
        exit(0)

# 모델 로드 및 설정
pipeline = AutoPipelineForImage2Image.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16, variant="fp16", use_safetensors=True
).to("cuda")  # GPU로 할당

# 이미지 로드
if args.init_img:
    init_image = load_image(args.init_img)
else:
    raise ValueError("Initial image (--init-img) is required for img2img")

# 저장 경로 및 파일 이름 정의
os.makedirs(args.outdir, exist_ok=True)
fixedImageNames = ['00000.png', '00001.png', '00002.png']

# 이미지 3장 생성 및 저장
for i, filename in enumerate(fixedImageNames):
    image = pipeline(
        prompt_in_english,  # 번역된 프롬프트 사용
        image=init_image,
        strength=args.strength,
        guidance_scale=args.guidance_scale,
        num_inference_steps=args.num_inference_steps
    ).images[0]
    output_path = os.path.join(args.outdir, filename)
    image.save(output_path)
    print(f"Image {i + 1} saved at {output_path}")
"""