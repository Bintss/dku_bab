// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout/');
    } catch (err) {
      console.log("Logout error (ignorable):", err);
    } finally {
      alert("로그아웃 되었습니다 👋");
      navigate('/'); 
    }
  };

  const handleMyInfo = () => {
    navigate('/me');
  };

  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 왼쪽: 로고 */}
        <Link to={isAuthPage ? "/" : "/user"} className="navbar-logo">
          🍚 DKU BAB
        </Link>

        {/* 오른쪽: 메뉴 버튼들 */}
        <div className="navbar-menu">
          {!isAuthPage ? (
            // [로그인 상태]일 때
            <>
              <button onClick={handleMyInfo} className="navbar-item">
                👤 내 정보
              </button>
              <span style={{color: 'rgba(255,255,255,0.5)', margin: '0 10px'}}>|</span>
              <button onClick={handleLogout} className="navbar-item">
                로그아웃
              </button>
            </>
          ) : (
            // [로그아웃 상태]일 때
            <>
              <Link to="/" className="navbar-item">로그인</Link>
              <Link to="/register" className="navbar-item">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}