import cv2
import numpy as np
import os
import glob
from natsort import natsorted
import sys
# 이미지 폴더와 저장 폴더 경로를 정의합니다.
image_folder_path = './images'
save_folder_path = './mask'

# 이미지 파일 경로를 자연 정렬합니다.
image_files = natsorted(glob.glob(os.path.join(image_folder_path, "*")))

# 첫 번째 '_'를 기준으로 앞의 숫자가 같은 파일들 중 첫 번째 파일만 선택합니다.
unique_files = {}
for file_path in image_files:
    # 파일 이름에서 첫 번째 '_' 앞의 부분을 추출합니다.
    base_name = os.path.basename(file_path)
    unique_key = base_name.split('_', 1)[0]
    if unique_key not in unique_files:
        unique_files[unique_key] = file_path

# 고유한 파일 경로만 포함하는 리스트를 생성합니다.
unique_image_files = list(unique_files.values())

# 펜 사이즈와 지우개 모드 설정
pen_size = 30
eraser_size = 30
drawing = False
erasing = False
stop = False
count = 0
def draw_circle(event, x, y, flags, param):
    global drawing, erasing, pen_size, eraser_size, mask
    color = (255, 255, 255) if not erasing else (0, 0, 0)
    thickness = pen_size if not erasing else eraser_size

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        cv2.circle(img, (x, y), pen_size, color, -1)
        cv2.circle(mask, (x, y), pen_size, color, -1)
    elif event == cv2.EVENT_MOUSEMOVE and drawing:
        cv2.circle(img, (x, y), pen_size, color, -1)
        cv2.circle(mask, (x, y), pen_size, color, -1)
    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        cv2.circle(img, (x, y), pen_size, color, -1)
        cv2.circle(mask, (x, y), pen_size, color, -1)

for image_file in unique_image_files:
    print(image_file)
    img_path = image_file
    save_path = os.path.join(save_folder_path, os.path.basename(image_file))

    img = cv2.imread(img_path)
    img_ori = img.copy()
    mask = np.zeros_like(img, dtype=np.uint8)  # 검정 배경의 마스크 생성

    cv2.namedWindow('img')
    cv2.setMouseCallback('img', draw_circle)

    while True:
        cv2.imshow('img', img)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):  # 종료
            stop=True
            break
        elif key == ord('r'):  # 리셋
            img = img_ori.copy()
            mask = np.zeros_like(img, dtype=np.uint8)
        elif key == ord('w'):  # 마스크 이미지 저장
            cv2.imwrite(save_path, mask)
            print(f"Saved masked image to {save_path}")
            count += 1
            break
        elif key == ord('1'):  # 펜/지우개 크기 증가
            pen_size += 5
            eraser_size += 5
        elif key == ord('2') and pen_size > 5:  # 펜/지우개 크기 감소
            pen_size -= 5
            eraser_size -= 5
        elif key == ord('e'):  # 지우개 모드 토글
            erasing = not erasing
    if stop:  # 종료
        cv2.destroyAllWindows()
        print(count)
        break