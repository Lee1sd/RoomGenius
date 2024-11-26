import React from "react";
import '../../style/title2.css';
import Startimage from '../../assets/이미지/pictureimg.png';
import Explain from '../../assets/이미지/paintedimg.png';
import Draw2 from '../../assets/이미지/txtimg.png';
import Inpaint from '../../assets/이미지/inpaintimg.jpg';
import { Link } from 'react-router-dom';

function Title2(){
    return(
        <div className="title2cont">

            <div className="titlestart">
                <img src={Startimage} className="startimage"></img>
                <div className="title2text">
                    <h3 className="two-line-text">Fill out your furniture and decorations by uploading <span
                        className="blue-text">photos</span>
                    </h3>
                    <p>원하는 가구로 집이 꾸며졌을 때 어떤 모습일지 궁금했던 적이 있나요?<br/>
                        RoomGenius와 함께라면 이제 그 상상을 현실로 만들어보세요. AI 기술을 활용하여 침실, 거실, 주방 등 모든 <br/>유형의 방을 원하는 스타일로 꾸밀 수 있습니다.
                        AI가 제안하는 최적의 인테리어로 나만의 공간을 완성해보세요!
                    </p>
                    <button className="title2button">
                        <Link to='/designcreate'>start</Link></button>
                </div>
            </div>

            <div className="titlestart2">
                <div className="title2text2">
                    <h3 className="two-line-text">Fill your furniture and decorations with <span className="blue-text">hand drawing</span>
                    </h3>
                    <p> 직접 그림을 그려 원하는 디자인 스타일과 가구를 배치해보세요.<br/> 당신이 그린 대로 방을 꾸며 원하는 분위기를 연출할 수 있습니다!
                    </p>
                    <button className="title2button2">
                        <Link to='/painting'>start</Link>
                    </button>
                </div>
                <img src={Explain} className="explain"></img>
            </div>

            <div className="titlestart3">
                <img src={Draw2} className="startimage"></img>
                <div className="title3text3">
                    <h3 className="two-line-text">Fill your furniture and decorations with <span
                        className="blue-text">text</span></h3>
                    <p>원하는 디자인 스타일과 객실 유형을 프롬프트로 작성하여<br/>
                        꾸밀 수 있습니다. 원하는 분위기로 방을 꾸며보세요!
                    </p>
                    <button className="title3button3">
                        <Link to='/textpro'>start</Link></button>
                </div>
            </div>

            <div className="titlestart2">
                <div className="title2text2">
                    <h3 className="two-line-text">Create only the parts <span className="blue-text">you want</span>
                    </h3>
                    <p> 부분적으로 수정하고 싶으신가요? <br/>
                        inpainting을 이용하여 원하는 부분만 다시 생성해 보세요!
                    </p>
                    <button className="title2button2">
                        <Link to='/painting'>start</Link>
                    </button>
                </div>
                <img src={Inpaint} className="explain"></img>
            </div>

        </div>

    );
}

export default Title2;