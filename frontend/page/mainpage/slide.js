import React,{useEffect} from "react";
import '../../style/Slideshow.css';


function Slide({ id, beforeImage, afterImage }){
  useEffect(() => {
    // 첫 번째 .comparison-slider 요소만 선택
    const element = document.querySelector(`.comparison-slider-${id}`);
    if (!element) return; // 요소가 없으면 종료

    // 기존의 슬라이더가 있으면 삭제
    const existingSlider = element.querySelector(".slider");

    if (existingSlider) {
      existingSlider.remove();
    }

    const slider = document.createElement("div");
    const resizeElement = element.getElementsByTagName("figure")[1];
    if (!resizeElement) return;

    const figcaption = {
      first: element.getElementsByTagName("figcaption")[0],
      second: element.getElementsByTagName("figcaption")[1],
    };

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    let ticking = false;

/*초기값 설정*/
    const setInitialPosition = () => {
      const maxWidth = element.offsetWidth;
      const initialPercentage = 50; // 구분 선 중앙에 위치
      const initialX = (maxWidth * initialPercentage) / 100;

      slider.style.left = `${initialPercentage}%`;
      resizeElement.style.clipPath = `polygon(${initialPercentage}% 0, 100% 0, 100% 100%, ${initialPercentage}% 100%)`;

      if (figcaption.first) {
        figcaption.first.classList.toggle('hide', initialX <= figcaption.first.offsetWidth);
      }

      if (figcaption.second) {
        figcaption.second.classList.toggle('hide', maxWidth - initialX <= figcaption.second.offsetWidth);
      }
    };
    /*초기값 설정*/

    const slide = (event) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;

          // 클라이언트 X 위치 계산
          const clientX = event.clientX ?? event.touches[0].clientX;
          const elementRect = element.getBoundingClientRect(); // 정확한 위치 계산
          const x = clientX - elementRect.left;

        // 슬라이더 위치를 이미지의 전체 범위(300px)로 계산
      const maxWidth = element.offsetWidth; // 컨테이너의 전체 너비
      let percentage = (x / maxWidth) * 100;//슬라이더 가동범위 조절

      percentage = Math.max(0, Math.min(percentage, 100));

          slider.style.left = `${percentage}%`;
          resizeElement.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;

          if (figcaption.first) {
            if (x <= figcaption.first.offsetWidth) {
              figcaption.first.classList.add("hide");
            } else {
              figcaption.first.classList.remove("hide");
            }
          }

          if (figcaption.second) {
            if (element.offsetWidth - x <= figcaption.second.offsetWidth) {
              figcaption.second.classList.add("hide");
            } else {
              figcaption.second.classList.remove("hide");
            }
          }
        });
      }
    };

    const dragStart = () => {
      element.addEventListener("mousemove", slide, { passive: true });
      element.addEventListener("touchmove", slide, { passive: true });
      element.classList.add("dragging");
    };

    const dragDone = () => {
      element.removeEventListener("mousemove", slide);
      element.removeEventListener("touchmove", slide);
      element.classList.remove("dragging");
    };

    slider.addEventListener("mousedown", dragStart, { passive: true });
    slider.addEventListener("touchstart", dragStart, { passive: true });

    document.addEventListener("mouseup", dragDone, { passive: true });
    document.addEventListener("touchend", dragDone, { passive: true });
    document.addEventListener("touchcancel", dragDone, { passive: true });

    slider.classList.add("slider");
    arrow.setAttribute("width", "20");
    arrow.setAttribute("height", "20");
    arrow.setAttribute("viewBox", "0 0 30 30");
    path.setAttribute("d", "M1,14.9l7.8-7.6v4.2h12.3V7.3l7.9,7.6l-7.9,7.7v-4.2H8.8v4.2L1,14.9z");
    arrow.append(path);
    slider.append(arrow);

    element.append(slider); // 슬라이더 추가

    // 슬라이더 초기 위치 설정
    setInitialPosition();
  }, [beforeImage, afterImage]);

  useEffect(() => {
    console.log("beforeImage:", beforeImage);
    console.log("afterImage:", afterImage);
    // 기존 코드
  }, [beforeImage, afterImage]);


  return(

    <div class={`comparison-slider comparison-slider-${id}`}>
    <figure>
        <img src={beforeImage} className="Slidebefore" alt="Before Image"/>
        <figcaption>Before</figcaption>
    </figure>
    <figure>
        <img src={afterImage} className="Slideafter" alt="After Image" />
        <figcaption>After</figcaption>
    </figure>
 </div>
  );
}
export default Slide;