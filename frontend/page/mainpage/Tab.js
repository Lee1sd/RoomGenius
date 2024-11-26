import React, { useState, useEffect, useRef } from 'react';
import '../../style/Tab.css'; // 스타일을 별도 CSS 파일에서 관리할 경우
import SlideCopy from './slidecopy';


function Tabs() {
  const [selectedTab, setSelectedTab] = useState(1);

  const firstSpanRef = useRef(null);
  const secondSpanRef = useRef(null);



  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 첫 번째 문장 애니메이션 실행
            if (firstSpanRef.current) {
              firstSpanRef.current.classList.add("animate");
              // 첫 번째 문장이 끝난 후 커서 제거 및 두 번째 문장 실행
              setTimeout(() => {
                if (firstSpanRef.current) {
                  firstSpanRef.current.style.borderRight = "none"; // 커서 제거
                }
                if (secondSpanRef.current) {
                  secondSpanRef.current.classList.add("animate");
                }
              }, 1000); // 첫 번째 문장 애니메이션 시간
            }
          } else {
            // 화면에서 벗어나면 초기화
            if (firstSpanRef.current) {
              firstSpanRef.current.classList.remove("animate");
              firstSpanRef.current.style.borderRight = "2px solid #007BFF"; // 커서 초기화
            }
            if (secondSpanRef.current) {
              secondSpanRef.current.classList.remove("animate");
            }
          }
        });
      },
      { threshold: 0.1 } // 요소가 10% 보일 때 트리거
    );

    if (firstSpanRef.current) observer.observe(firstSpanRef.current);
    if (secondSpanRef.current) observer.observe(secondSpanRef.current);

    return () => {
      if (firstSpanRef.current) observer.unobserve(firstSpanRef.current);
      if (secondSpanRef.current) observer.unobserve(secondSpanRef.current);
    };
  }, []);

  return (
    <div className="parent-container">

      <div className="Tabh3">
      <h3>AI Rendering Solution for Design Visualization </h3>
      </div>

    <div className="tabcontainer">
      <div className="tabs">
        <input
          type="radio"
          id="radio-1"
          name="tabs"
          checked={selectedTab === 1}
          onChange={() => setSelectedTab(1)}
        />
        <label className="tab" htmlFor="radio-1">
          Living Room
        </label>

        <input
          type="radio"
          id="radio-2"
          name="tabs"
          checked={selectedTab === 2}
          onChange={() => setSelectedTab(2)}
        />
        <label className="tab" htmlFor="radio-2">Bathroom</label>

        <input
          type="radio"
          id="radio-3"
          name="tabs"
          checked={selectedTab === 3}
          onChange={() => setSelectedTab(3)}
        />
        <label className="tab" htmlFor="radio-3">Kitchen</label>

        <input
          type="radio"
          id="radio-4"
          name="tabs"
          checked={selectedTab === 4}
          onChange={() => setSelectedTab(4)}
        />
        <label className="tab" htmlFor="radio-4">Bedroom</label>

        <span className="glider"></span>

      </div>
    </div>

     <SlideCopy selectedTab={selectedTab} />

     <div className="Tablanguage">
        <span ref={firstSpanRef} className="Tablanguage-span">
       RoomGenius는 다양한 언어의 프롬프트를 지원해 </span> <br/>
       <span ref={secondSpanRef} className='Tablanguage-span2'>
        전 세계 사용자들이 손쉽게 디자인을 요청할 수 있습니다.</span>
    </div>

</div>
  );
}

export default Tabs;
