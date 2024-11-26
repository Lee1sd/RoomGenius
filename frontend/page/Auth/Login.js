import React, { useContext, useState } from "react";
import '../../style/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/Auths';
import Footer from '../../components/footer';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    const isSuccess = login(credentials.username, credentials.password);
    if (isSuccess) {
      navigate("/");
    }
  };

  return (
    <div className="Sign">
      <div className="S-under">
        <input type="text" name="username" className="Signupid" placeholder="아이디" onChange={handleChange} />
        <input type="password" name="password" className="Signuppass" placeholder="비밀번호" onChange={handleChange} />
      </div>

      <div className="SignCheck">
        <div className="CheckboxWrapper">
          <input type="checkbox" id="login" name="login" />
          <label htmlFor="login">로그인 상태 유지</label>
        </div>
        <button className="Signlogin" onClick={handleLogin}>로그인</button>
        <Link to="/signup" className="LinkSign">회원가입</Link>
      </div>

      <div className="Signupline2"></div>

      <div className="Signfooter">
        <Footer />
      </div>
    </div>
  );
}

export default Login;
