import React from "react";
import '../../assets/이미지/ss.jpg';
import '../../style/intro.css';
import Text from'../../assets/이미지/textbox.png'
import Control from'../../assets/이미지/control.png'
import Upload from'../../assets/이미지/upload.png'
import { useNavigate } from 'react-router-dom';
import VideoFile from '../mainpage/video.mp4';

function Intro(){
  const navigate = useNavigate(); // useNavigate 훅을 통해 페이지 전환 기능을 사용할 수 있습니다.

  const handleStartNowClick = () => {
     navigate('/designcreate')
  };


   return(
     <div className="introContainer">
       <div className="Introline"></div>

       <div className="introvi">
           <div className="introtitle">
               {/*<h1>Room design with <span class="highlight">AI,</span><br/>to make it <span class="highlight">easy</span></h1>*/}

               <h1>
                   Room design with&nbsp;
                   <span className="highlight" style={{animationDelay: '0s'}}>A</span>
                   <span className="highlight" style={{animationDelay: '0.1s'}}>I</span>
                   <br/>
                   to make it&nbsp;
                   <span className="highlight" style={{animationDelay: '0.2s'}}>E</span>
                   <span className="highlight" style={{animationDelay: '0.3s'}}>a</span>
                   <span className="highlight" style={{animationDelay: '0.4s'}}>s</span>
                   <span className="highlight" style={{animationDelay: '0.5s'}}>y</span>
               </h1>

               <p>사진을 업로드 하여 당신의 공간이 더욱 아름다울 수 있도록<br/>
                   RoomGenius에서 손 쉽게 인테이러에 도전해보세요.
               </p>
               <button className="Introstart" onClick={handleStartNowClick}> start now</button>
           </div>

           {/* 비디오를 추가할 영역 */}
           <div className="introVideo">
               <video width="830px" height="auto" controls autoPlay muted loop>
                   <source src={VideoFile} type="video/mp4"/>
               </video>
           </div>

       </div>


     </div>

   );

}

export default Intro;
