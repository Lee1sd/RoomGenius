import React from "react";
import '../style/Modalprofile.css';
import { useState, useRef, useEffect, useContext } from "react";
import userImage from '../assets/이미지/user.png';
import Close from '../assets/이미지/icon-delet.png';
import { NameContext } from '../page/Auth/NameContext'

const Modalprofile = ({ isOpen, onClose, onImageChange, onNameChange }) => {
     const { name, setName,  profileImage, setProfileImage } = useContext(NameContext);
    const [image, setImage] = useState(profileImage ||userImage); // 선택한 이미지를 저장할 상태
    const fileInputRef = useRef(null);



   // 모달이 열릴 때마다 부모로부터 전달된 이미지를 동기화
   useEffect(() => {
    if (isOpen) {
      setImage(profileImage); // 부모의 이미지로 설정
    }
  }, [isOpen, profileImage]);

    // 파일 선택 후 이미지 변경 처리
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result;
                setImage(newImage); // 이미지 미리보기
                setProfileImage(newImage); // Context 상태 업데이트

                // 부모로 이미지 전달 (Header 컴포넌트에서 받음)
                if (onImageChange) {
                    onImageChange(newImage); // 부모 컴포넌트에 전달
                }
            };
            reader.readAsDataURL(file); // 파일을 읽어들여 Data URL로 변환
        }
    };


    const handleImageClick = () => {
        fileInputRef.current.click(); // 파일 입력 요소 클릭
    };

    const handleNameInputChange = (e) => {
        setName(e.target.value); // 입력된 이름 업데이트
    };

    const handleSave = () => {

        if (onNameChange) {
            onNameChange(name);
            // 부모 컴포넌트로 이름 전달 header에 onNameChange={handleNameChange} 이부분 전달 받아서 호출
        }
        onClose(); // 모달 닫기
    };

    if (!isOpen) return null; // 모달이 열려 있지 않으면 아무 것도 렌더링하지 않음

    return (
        <div className="modalprofile-overlay">
        <div className={`changecont ${isOpen ? "is-open" : ""}`}>
        <div className="changeinfocont">
        <div className="modal-header">
                        <h3>정보수정</h3>
                        <img src={Close} className="close-icon" onClick={onClose} alt="Close" />
                    </div>
            <div className="changeimage" onClick={handleImageClick}>
            {image ? (
                            <img src={image} alt="업로드된 이미지" className="preview-image" />
                        ) : (
                            <img src={userImage} alt="사용자 아이콘" className="user-icon" />
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-upload"
                        ref={fileInputRef} // ref 연결
                        style={{ display: 'none' }} // 파일 입력을 숨김
                    />

            <div className="changename">
                <h4>이름</h4>
                <input type="text" className="changenamebox" value={name} onChange={handleNameInputChange}></input>
            </div>

            <div className="changephonebox">
                <h4>연락처</h4>
                <input type="text" className="phonenamebox"></input>
            </div>

            <button onClick={handleSave} className="changecheck">확인</button>
          </div>
        </div></div>
    );
};

export default Modalprofile;
