import React from "react";
import '../../style/title1.css';
import Real from '../../assets/이미지/real-time.png';
import Interface from '../../assets/이미지/interface.png';
import Planning from '../../assets/이미지/planning.png';
import House from '../../assets/이미지/house.png';

function Title1() {
    return (
      <>

         {/* 새로운 공통 컨테이너 */}
        <div className="contentContainer">
        <div className="whyRoom">
          <h3>why RoomGenius AI</h3>
        </div>
          <div className="custone">

            <div className="customized1">
               <div className="costoneinner">
                  <img src={House} className="Design-icon"></img>
              </div>

              <div className="inner-expain">
              <h3>개인 맞춤형 인테리어</h3>
              <span>사용자가 업로드한 방 사진을 컴퓨터 비전  <br/>기술로
              분석해 방의 크기, 형태, 가구 배치 <br/>등을 파악한 후,
              사용자가 선호하는 <br/> 인테리어 스타일에 맞춰 가구와 소품을<br/> 추천합니다.</span>
              </div>

            </div>

            <div className="customized2">

            <div className="costoneinner">
                  <img src={Real} className="custmozied2image"></img>
              </div>
             <div className="inner-expain">
              <h3>실시간 디자인 시각화</h3>
              <span>사용자가 선택한 인테리어 스타일과 가구<br/> 배치, 색상
              조합을 시각화 할 수 있도록<br/> 합니다. 이를 위해 선택된
              가구와 소품을<br/> 방 사진에 실시간으로 생성하여 디자인
              결과<br/>를 즉시 확인할 수 있는 기술을 제공합니다.</span>
              </div>
            </div>
          </div>

          <div className="custtwo">

            <div className="customized3">
            <div className="costoneinner">
                  <img src={Interface} className="custmozied3image"></img>
              </div>
            <div className="inner-expain2">
              <h3>사용자 친화적인 인테페이스</h3>
              <span>RoomGenius의 웹 애플리케이션은 직관적<br/>이고 사용하기 쉬운 인터페이스를
              제공해야<br/>합니다. 다양한 기능을 효과적으로 배치하여<br/> 사용자에게
              직관적인 디자인 환경을 제공<br/>하고 모든 사용자가 편리하게 <br/>접근할 수 있도록 합니다.</span>
             </div>
            </div>

            <div className="customized4">

            <div className="costoneinner">
                  <img src={Planning} className="custmozied4image"></img>
              </div>

              <div className="inner-expain">
              <h3>예산 관리 및 비용 추정 기능</h3>
              <span> 예산 관리 및 비용 추정 기능을 구현합니다.<br/>
              이를 통해 사용자는 자신의 예산에 맞는  <br/>최적의 디자인을 선택할 수 있습니다.</span>
              </div>
            </div>
          </div>
        </div>

      </>
    );
}

export default Title1;
