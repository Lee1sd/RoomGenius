import os
import time
import pandas as pd
from PIL import Image
import requests
from io import BytesIO
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException
import webbrowser
from pathlib import Path
def scrape_ikea_search_results(driver, output_dir="D:/RoomGenius/backend/ikea_results", csv_file="D:/RoomGenius/backend/products.csv"):
    # Ensure the output directory for images exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # List to store product information
    product_data = []

    try:
        # Locate all product elements on the page
        product_elements = driver.find_elements(By.CSS_SELECTOR, ".plp-fragment-wrapper")  # Update selector as needed

        for index, product in enumerate(product_elements):
            try:
                # Extract product details: name, price, and image URL
                name = product.find_element(By.CSS_SELECTOR, ".notranslate.plp-price-module__product-name").text
                price = product.find_element(By.CSS_SELECTOR, ".plp-price__integer").text
                image_url = product.find_element(By.CSS_SELECTOR, "img.plp-image").get_attribute("src")

                print(f"제품 이름: {name}, 가격: {price}, 이미지 URL: {image_url}")
                image_path = os.path.join(output_dir, f"product_{index + 1}.png").replace("\\", "/")

                product_data.append({"제품 이름": name, "가격": price, "이미지 경로": image_path})

                # Download and save image to `ikea_results` directory
                image_response = requests.get(image_url)
                img = Image.open(BytesIO(image_response.content))
                img.save(image_path)

                print(f"제품 스크린샷이 저장되었습니다: {image_path}")

            except Exception as e:
                print(f"제품 정보를 추출하는데 실패했습니다: {e}")
                continue

    except Exception as e:
        print(f"제품 목록을 찾는 중 오류가 발생했습니다: {e}")
        return

    # Save product information to CSV in `cap/roomgenius-app`
    if product_data:
        csv_file = Path("D:/RoomGenius/backend/products.csv")
        df = pd.DataFrame(product_data)
        df.to_csv(csv_file, index=False, encoding='utf-8-sig')
        print(f"제품 정보가 CSV 파일에 저장되었습니다: {csv_file}")
    else:
        print("저장할 제품 정보가 없습니다.")

def upload_image_to_ikea(image_path):
    # 브라우저 옵션 설정
    options = webdriver.ChromeOptions()

    # Chrome 브라우저를 모니터에 띄우지 않도록 설정
    # 1. 최소화된 상태로 실행
    options.add_argument("--start-minimized")  # 브라우저 최소화

    # 2. 또는 브라우저 창을 화면 밖으로 이동시키기
    options.add_argument("--window-position=-10000,0")  # 화면 밖으로 브라우저 이동

    # 드라이버 실행
    driver = webdriver.Chrome(options=options)
    driver.get("https://www.ikea.com/kr/ko/")

    time.sleep(3)  # 페이지가 완전히 로드되도록 대기

    search_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".search-btn.search-box__button.single"))
    )
    search_button.click()

    visual_search_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "search-box__visualsearch"))
    )

    driver.execute_script("arguments[0].scrollIntoView(true);", visual_search_button)

    try:
        visual_search_button.click()
    except ElementClickInterceptedException:
        modal_close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".modal__cancel-button"))
        )
        modal_close_button.click()
        time.sleep(1)
        visual_search_button.click()

    upload_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".visual__modal-upload_button input[type='file']"))
    )

    upload_input.send_keys(image_path)

    time.sleep(10)  # 결과 페이지 로드 대기

    scrape_ikea_search_results(driver)

    driver.quit()


# 사용 예시
generated_image_path = "D:/RoomGenius/backend/output_images/samples/00000.png"
upload_image_to_ikea(generated_image_path)
