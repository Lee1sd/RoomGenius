"""import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import argparse, os
import openai
from dotenv import load_dotenv
from PIL import Image

def main():
    # LLM 관련 설정
    load_dotenv()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai.api_key = openai_api_key

    # Argument parsing
    parser = argparse.ArgumentParser(description="Generate images using Stable Diffusion with a custom prompt.")

    parser.add_argument(
        "--prompt",
        type=str,
        default="A modern minimalist living room with large windows that allow plenty of natural light.",
        help="The prompt to render"
    )
    parser.add_argument(
        "--outdir",
        type=str,
        default="C:/Users/MMClab/RoomGenius/backend/output_images/samples",
        help="The output directory for images"
    )
    parser.add_argument(
        "--ddim_steps",
        type=int,
        default=50,
        help="Number of ddim steps"
    )

    args = parser.parse_args()

    # 프롬프트를 분석하는 함수
    def analyze_prompt(prompt):

        # 방과 인테리어와 관련된 키워드 목록을 정의합니다.
        relevant_keywords = ["room", "interior", "furniture", "home", "design", "atmosphere"]

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

    # 1. 프롬프트 분석 (적절하지 않으면 중지)
    if not analyze_prompt(args.prompt):
        print("This image cannot be generated. Please reformat your prompt.")
        return
    else:
        print("Success to generate")

    model_id = "stabilityai/stable-diffusion-2-1"

    # Use the DPMSolverMultistepScheduler (DPM-Solver++) scheduler here instead
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to("cuda")

    prompt = args.prompt
    output_dir = args.outdir
    ddim_steps = args.ddim_steps

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    fixed_image_names = ['00000.png', '00001.png', '00002.png']

    # Generate and save images
    for i, filename in enumerate(fixed_image_names):
        image = pipe(prompt).images[0]  # Generate image from prompt
        resized_image = image.resize((512, 512), Image.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        image.save(output_path)
        print(f"Image {i + 1} saved at {output_path}")

    print(f"Images saved at {output_dir} with {ddim_steps} ddim steps.")

if __name__ == "__main__":
    main()

"""

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import argparse, os
import openai
from dotenv import load_dotenv
from PIL import Image

def main():
    # LLM 관련 설정
    load_dotenv()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai.api_key = openai_api_key

    # Argument parsing
    parser = argparse.ArgumentParser(description="Generate images using Stable Diffusion with a custom prompt.")
    parser.add_argument("--prompt", type=str, default="A modern minimalist living room with large windows that allow plenty of natural light.", help="The prompt to render")
    parser.add_argument("--outdir", type=str, default="D:/RoomGenius/backend/output_images/samples", help="The output directory for images")
    parser.add_argument("--ddim_steps", type=int, default=50, help="Number of ddim steps")
    args = parser.parse_args()

    # 번역 함수
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
                {"role": "system", "content": "You are an assistant that analyzes if a prompt is requesting interior design, furniture, or room-related images."},
                {"role": "user", "content": f"Is the following text asking for a furniture, interior design, or room image generation request? Answer with 'Yes' or 'No': {prompt}"}
            ],
            max_tokens=10,
            temperature=0
        )
        result = response['choices'][0]['message']['content'].strip()
        return result.lower() == "yes"

    # 1. 프롬프트 번역 (한국어 프롬프트를 영어로 변환)
    prompt_in_english = translate_to_english(args.prompt)
    print(f"Translated prompt: {prompt_in_english}")

    # 2. 프롬프트 분석 (적절하지 않으면 중지)
    if not analyze_prompt(prompt_in_english):
        print("This image cannot be generated. Please reformat your prompt.")
        return
    else:
        print("Success to generate")

    model_id = "stabilityai/stable-diffusion-2-1"

    # Stable Diffusion 모델 설정 및 스케줄러 설정
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to("cuda")

    output_dir = args.outdir
    ddim_steps = args.ddim_steps

    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    fixed_image_names = ['00000.png', '00001.png', '00002.png']

    # 번역된 프롬프트로 이미지 생성 및 저장
    for i, filename in enumerate(fixed_image_names):
        image = pipe(prompt_in_english).images[0]
        resized_image = image.resize((512, 512), Image.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        resized_image.save(output_path)
        print(f"Image {i + 1} saved at {output_path}")

    print(f"Images saved at {output_dir} with {ddim_steps} ddim steps.")

if __name__ == "__main__":
    main()


