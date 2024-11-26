from PIL import Image

# 입력 이미지 경로
input_image_path = "C:/Users/MMClab/RoomGenius/AI/scripts/zz.png"
# 출력 이미지 경로
output_image_path = "C:/Users/MMClab/RoomGenius/AI/scripts/zz_resize.png"

# 이미지 열기
img = Image.open(input_image_path)

# 새 크기 설정
new_size = (512, 512)  # 원하는 크기로 변경
resized_img = img.resize(new_size, Image.LANCZOS)

# 이미지 저장
resized_img.save(output_image_path)
