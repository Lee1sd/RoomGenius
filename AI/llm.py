import openai
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수를 불러옵니다.
load_dotenv()

# 환경 변수에서 API 키를 가져옵니다.
openai_api_key = os.getenv("OPENAI_API_KEY")

# OpenAI API 키를 설정합니다.
openai.api_key = openai_api_key


def analyze_prompt(prompt):
    """
    영어로 작성된 프롬프트를 분석하고, 인테리어와 관련된 텍스트인지 확인하는 함수.
    프롬프트가 방이나 가구, 인테리어 디자인 요구와 관련된지 확인.
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # 최신 모델로 변경
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


def process_prompt(prompt):
    """
    프롬프트를 처리하여 이미지 생성 가능 여부를 결정하는 함수
    """
    if analyze_prompt(prompt):
        print("The prompt is valid. Starting image generation.")
        # 이미지 생성 로직을 여기에 추가합니다.
    else:
        print("This image cannot be generated. Please reformat your prompt.")


# 사용자가 입력한 프롬프트 예시
user_prompt = input("Enter your prompt: ")
process_prompt(user_prompt)
