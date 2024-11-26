import torch
from diffusers import AutoPipelineForImage2Image
from diffusers.utils import load_image
import os

# CUDA 사용 가능 여부 확인
# print(torch.cuda.is_available())

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# 모델 로드 및 설정
pipeline = AutoPipelineForImage2Image.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16, variant="fp16", use_safetensors=True
)
pipeline.enable_model_cpu_offload()
# pipeline.enable_xformers_memory_efficient_attention()  # xformers 미설치 시 이 줄 제거

# 이미지 준비
url = "D:/RoomGenius/AI/scripts/bangu_resize.png"
init_image = load_image(url)

prompt = "Warm furniture and atmospheric interiors and one bed"
strength = 0.7  # 원본 이미지와 유사한 강도

# 저장 경로 및 파일 이름 정의
output_dir = "D:/RoomGenius/backend/output_images/samples"
os.makedirs(output_dir, exist_ok=True)
fixedImageNames = ['00000.png', '00001.png', '00002.png']

# 이미지 3장 생성 및 저장
for i, filename in enumerate(fixedImageNames):
    image = pipeline(prompt, image=init_image, strength=strength).images[0]
    output_path = f"{output_dir}/{filename}"
    image.save(output_path)
    print(f"Image {i+1} saved at {output_path}")
