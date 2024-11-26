import React, { useEffect, useState } from "react";
import Slide from "./slide";
import Image1 from "../../assets/이미지/livingroom1.png";
import Image2 from "../../assets/이미지/livingroom2.png";
import Image3 from "../../assets/이미지/bathroom1.png";
import Image4 from "../../assets/이미지/bathroom2.png";
import Image5 from "../../assets/이미지/kitchen1.png";
import Image6 from "../../assets/이미지/kitchen2.png";
import Image7 from "../../assets/이미지/bedroom1.png";
import Image8 from "../../assets/이미지/bedroom2.png";

import Korea from "../../assets/이미지/korea.png";
import China from "../../assets/이미지/china.png";
import USA from "../../assets/이미지/USA.png";
import Egypt from "../../assets/이미지/egypt.png";
import Brazil from "../../assets/이미지/brazil.png";

function SlideCopy({ selectedTab }) {
  const [visibleTexts, setVisibleTexts] = useState([false, false, false, false]);

  const TabTexts = {
    1: [
        "시원하고 깨끗한 느낌의 안락한 거실", // 한국어
        "غرفة معيشة مريحة تشعر بالانتعاش والنظافة", // 이집트어
        "A cool and clean feeling cozy living room", // 영어
        "清爽干净且舒适的客厅", // 중국어
        "Sala aconchegante e fresca" // 브라질어
    ],
    2: [
        "어린이를 위한 깨끗하고 멋진 욕실", // 한국어
        "حمام نظيف وأنيق للأطفال", // 이집트어
        "A clean and stylish bathroom for children", // 영어
        "为儿童设计的干净又时尚的浴室", // 중국어
        "Um banheiro limpo e estiloso para crianças" // 브라질어
    ],
    3: [
        "빈티지스러운 아늑한 주방", // 한국어
        "مطبخ دافئ بطراز عتيق", // 이집트어
        "Vintage-inspired cozy kitchen", // 영어
        "复古温馨的厨房", // 중국어
        "Cozinha acolhedora de estilo vintage" // 브라질어
    ],
    4: [
        "분홍색 배경의 세련된 여자아이 침실", // 한국어
        "غرفة نوم أنيقة لفتاة بخلفية وردية", // 이집트어
        "Stylish girl's bedroom with a pink background", // 영어
        "粉红色背景的时尚女孩卧室", // 중국어
        "Quarto de menina sofisticado com fundo rosa" // 브라질어
    ]
};


  const images = {
    1: [Image1, Image2],
    2: [Image3, Image4],
    3: [Image5, Image6],
    4: [Image7, Image8],
  };

  const beforeImage = images[selectedTab]?.[0];
  const afterImage = images[selectedTab]?.[1];

  useEffect(() => {
    // 초기화: 모든 텍스트를 숨김 상태로 설정
    setVisibleTexts([false, false, false, false]);

    // 순차적으로 텍스트 표시
    setTimeout(() => {
      TabTexts[selectedTab]?.forEach((_, index) => {
        setTimeout(() => {
          setVisibleTexts((prev) => {
            const newVisibleTexts = [...prev];
            newVisibleTexts[index] = true;
            return newVisibleTexts;
          });
        }, index * 350); // 400ms 간격으로 표시
      });
    }, 300); // 100ms 지연
  }, [selectedTab]);

  // 선택된 탭이 유효하지 않을 경우 렌더링하지 않음
  if (!TabTexts[selectedTab]) return null;

  return (
    <div className="slide-container">
      <Slide id={selectedTab} beforeImage={beforeImage} afterImage={afterImage} />

      <div className="contry">
        <div className="korea">
           <img src={Korea} alt="Korea" />
          <h2
            style={{
              opacity: visibleTexts[0] ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              visibility: visibleTexts[0] ? "visible" : "hidden", // 초기 렌더링 시 완전히 숨김
              backgroundColor: "#DFEAFF", // 하이라이트 색상 추가
              padding: "15px", // 텍스트와 하이라이트 사이 여백
              width:"610px",
              borderRadius: "10px", // 하이라이트 둥근 모서리
            }}
          >
            {TabTexts[selectedTab][0]}
          </h2>

        </div>

        <div className="Egypt">
          <img src={Egypt} alt="Egypt" />
          <h2
            style={{
              opacity: visibleTexts[1] ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              visibility: visibleTexts[1] ? "visible" : "hidden",
              backgroundColor: "#DFEAFF", // 하이라이트 색상 추가
              padding: "15px", // 텍스트와 하이라이트 사이 여백
              width:"610px",
              borderRadius: "10px", // 하이라이트 둥근 모서리
            }}
          >
            {TabTexts[selectedTab][1]}
          </h2>

        </div>

        <div className="USA">
          <img src={USA} alt="USA" />
          <h2
            style={{
              opacity: visibleTexts[2] ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              visibility: visibleTexts[2] ? "visible" : "hidden",
              backgroundColor: "#DFEAFF", // 하이라이트 색상 추가
              padding: "15px", // 텍스트와 하이라이트 사이 여백
              width:"610px",
              borderRadius: "10px", // 하이라이트 둥근 모서리
            }}
          >
            {TabTexts[selectedTab][2]}
          </h2>

        </div>


        <div className="China">
          <img src={China} alt="China" />
          <h2
            style={{
              opacity: visibleTexts[3] ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              visibility: visibleTexts[3] ? "visible" : "hidden",
              backgroundColor: "#DFEAFF", // 하이라이트 색상 추가
              padding: "15px", // 텍스트와 하이라이트 사이 여백
              width:"610px",
              borderRadius: "10px", // 하이라이트 둥근 모서리
            }}
          >
            {TabTexts[selectedTab][3]}
          </h2>

        </div>

        <div className="Brazil">
          <img src={Brazil} alt="Brazil" />
          <h2
            style={{
              opacity: visibleTexts[4] ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              visibility: visibleTexts[4] ? "visible" : "hidden",
              backgroundColor: "#DFEAFF", // 하이라이트 색상 추가
              padding: "15px", // 텍스트와 하이라이트 사이 여백
              width:"610px",
              borderRadius: "10px", // 하이라이트 둥근 모서리
            }}
          >
            {TabTexts[selectedTab][4]}
          </h2>

        </div>


      </div>
    </div>
  );
}

export default SlideCopy;
