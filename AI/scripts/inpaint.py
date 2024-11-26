import argparse
from diffusers import AutoPipelineForInpainting
from diffusers.utils import load_image
import torch
import os
import openai
from dotenv import load_dotenv

# Load environment variables for OpenAI API
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

# argparse를 통해 명령줄 인수 설정
parser = argparse.ArgumentParser(description="Run inpainting with Stable Diffusion.")
parser.add_argument("--prompt", type=str, required=True, help="Text prompt for image generation")
parser.add_argument("--init-img", type=str, required=True, help="Path to the initial image")
parser.add_argument("--mask-img", type=str, required=True, help="Path to the mask image")
parser.add_argument("--strength", type=float, default=0.99, help="Strength of the inpainting (0 to 1)")
parser.add_argument("--outdir", type=str, required=True, help="Directory to save the generated image")
parser.add_argument("--num-inference-steps", type=int, default=20, help="Number of inference steps")
args = parser.parse_args()
# strength  원본 이미지가 새로운 이미지로 변형되는 정도

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

# 번역된 프롬프트 생성
prompt_in_english = translate_to_english(args.prompt)
print(f"Translated prompt: {prompt_in_english}")


# 모델 로드
pipe = AutoPipelineForInpainting.from_pretrained(
    "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# 출력 디렉토리 생성
if not os.path.exists(args.outdir):
    os.makedirs(args.outdir)

# 이미지와 마스크 로드
image = load_image(args.init_img).resize((1024, 1024))
mask_image = load_image(args.mask_img).resize((1024, 1024))

# Inpainting 파라미터 설정
guidance_scale = 20.0 # 적절한 값으로 설정 가능  프롬프트가 이미지에 반영되는 정도
generator = torch.Generator(device="cuda").manual_seed(42)

# 고정된 파일 이름 리스트
fixed_image_names = ['00000.png', '00001.png', '00002.png']

# 이미지 3장 생성 및 저장
for i, filename in enumerate(fixed_image_names):
    result = pipe(
        prompt=[prompt_in_english, "real world"],  # 두 개의 프롬프트 사용
        negative_prompt=["text", "person body"],  # 부정 프롬프트도 두 개 사용
        image=image,
        mask_image=mask_image,
        guidance_scale=guidance_scale,
        num_inference_steps=args.num_inference_steps,
        strength=args.strength,
        generator=generator,
    ).images[0]

    # 결과 저장
    save_path = os.path.join(args.outdir, filename)
    result.save(save_path)
    print(f"Image {i + 1} saved at {save_path}")