import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../page/Auth/Auths';
import { GoChevronDown } from "react-icons/go"; // 아이콘 가져오기
import '../style/Header.css';
import Modal from './Modal';
import Modalprofile from '../components/Modalproflie';
import RoomIconinfo from '../assets/이미지/user.png';
import RoomIcon from '../assets/이미지/user.png';
import LogoRoom from '../assets/이미지/logoroom.png';


function Header() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  // **[변경 부분] 프로필 이미지 상태 관리**
   const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") ||RoomIcon);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // 드롭다운 상태 관리
  const [timeoutId, setTimeoutId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리
  const [isModalLogoutOpen, setIsModalLogoutOpen] = useState(false); // 모달 상태 관리
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [name, setName] = useState(localStorage.getItem("profileName") ||"홍길동"); // 기본 이름 설정


  const handleNameChange = (newName) => {
    setName(newName); // 입력된 이름으로 이름 업데이트
    localStorage.setItem("profileName", newName);
};

   // **[변경 부분] 모달에서 프로필 이미지 변경 시 호출되는 함수**
   const handleProfileImageChange = (newImage) => {
     setProfileImage(newImage); // 프로필 이미지 상태 업데이트
     localStorage.setItem("profileImage", newImage);
   };


  const handleLogout = async () => {
    setIsModalLogoutOpen(false);
    setIsProfileModalOpen(false); // 프로필 모달 닫기S
       logout(); // 로그아웃 함수 호출
      navigate('/'); // 로그아웃 후 메인 페이지로 이동

  };

  useEffect(() => {
    console.log("isProfileModalOpen 상태:", isProfileModalOpen);
  }, [isProfileModalOpen]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId); // 이전의 타이머가 있다면 정리
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 300); // 300ms 후에 드롭다운을 닫음
    setTimeoutId(id); // 타이머 ID 저장
  };

  // 드롭다운에 마우스가 들어왔을 때 타이머를 정리
  const handleDropdownMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId); // 드롭다운에 마우스가 올라가면 타이머 정리
    }
  };

  // 드롭다운에서 마우스가 떠날 때 타이머 설정
  const handleDropdownMouseLeave = () => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 100); // 300ms 후에 드롭다운을 닫음
    setTimeoutId(id); // 타이머 ID 저장
  };

  const handleSecession = async () => {
    setProfileImage(RoomIconinfo);
    setIsModalOpen(false); // 모달 닫기
    setIsProfileModalOpen(false); // 프로필 모달 닫기
    logout();
    navigate('/');
    // 여기에 회원 탈퇴 API 요청을 추가
    // ...


  };

  return (
    <header className='Header'>

      <Link to="/" className="RoomGenius" >Room Genius</Link>
      <img src={LogoRoom} className='logoroom'></img>
      <nav className="hader-nav">
        {isLoggedIn && (
          <div className='Roomchange-nav'>
              <Link to="/Myproject" className="intetiot-nav">내 프로젝트</Link>
            <Link to="/gallery" className="gallery-nav">인테리어 갤러리</Link>
            <Link to="/designcreate" className="intetiot-nav">AI 인테리어</Link>
          </div>
        )}
        {isLoggedIn ? (
          <div className="Room-menu" ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          >
            <div className="Roomprofile" onClick={() => setIsProfileModalOpen(true)}>
            <img src={profileImage ? profileImage : RoomIconinfo} alt="프로필" className="Roomicon" />
            </div>
            {dropdownOpen && (
              <div className="Room-dropdown"
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}>
                <div className='dropupload'>

                <img src={profileImage} alt="프로필" className="dropicon"
                onClick={() => {console.log("프로필 모달 열기 클릭");setIsProfileModalOpen(true);}}
              />

                <div className='dropname'>{name}</div>
                </div>
                <div className='dropline'></div>
                <div className="Roomlogout" onClick={(handleLogout) => setIsModalLogoutOpen(true)}>로그아웃</div>
                <div className='dropline2'></div>
                <div className="Roomout" onClick={(handleSecession) => setIsModalOpen(true)}>회원탈퇴</div>
              </div>
            )}
          </div>
        ) : (
          <div className='auth-links'>
            <Link to="/login">로그인</Link>
            <Link to="/Signup">회원가입</Link>
          </div>
        )}
      </nav>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSecession}
        title="회원탈퇴"
        message="가입된 회원정보와 작성한 프로젝트는 모두 삭제됩니다. 탈퇴 후 같은 계정으로 재가입 시 기존 데이터는 복원되지 않습니다. 회원 탈퇴를 진행하시겠습니까?"
        confirmText="탈퇴하기"

      />

      <Modal
        isOpen={isModalLogoutOpen}
        onClose={() => setIsModalLogoutOpen(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
      />

   <Modalprofile
        isOpen={isProfileModalOpen}
        name={name}
        onClose={() => setIsProfileModalOpen(false)}
        onImageChange={handleProfileImageChange}
        profileImage={profileImage} // 현재 이미지 전달
        onNameChange={handleNameChange} // 이름 변경 함수 전달
      />

    </header>
  );
}

export default Header;
