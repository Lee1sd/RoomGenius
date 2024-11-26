import React, { useContext, useState } from "react";
import '../../style/Signup.css';
import{ Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/Auths';
import Footer from "../../components/footer";
function Signup() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignup = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    signup({
      username: formData.username,
      password: formData.password,
      name: formData.name
    });

    navigate("/login");
  };

  return (
    <div className="PageSignup H-under">
      <img src={require('../../assets/이미지/user.png')} className="Roomuser" alt="user"/>
      <input type="text" name="username" className="Roomid" placeholder="아이디" onChange={handleChange} />
      <input type="password" name="password" className="RoomPass" placeholder="비밀번호" onChange={handleChange} />
      <input type="password" name="confirmPassword" className="PassCheck" placeholder="비밀번호 확인" onChange={handleChange} />
      <input type="text" name="name" className="Roomname" placeholder="이름을 입력하세요" onChange={handleChange} />

      <button className="Roomjoin" onClick={handleSignup}>가입하기</button>

      <div className="Loginline2"></div>

      <div className="Loginfooter">
        <Footer />
      </div>
    </div>
  );
}
export default Signup;