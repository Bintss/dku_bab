// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  // 로그아웃 기능: 백엔드 API를 호출하여 세션을 종료합니다.
  const handleLogout = async () => {
    try {
      // Django의 logout API 호출 (세션 초기화)
      await axios.post('http://localhost:8000/api/auth/logout/');
    } catch (err) {
      console.log("Logout error (ignorable):", err); 
    } finally {
      // 로그아웃 알림 후, 로그인 화면으로 이동
      alert("로그아웃 되었습니다 👋");
      navigate('/'); 
    }
  };

  // [내 정보] 버튼 기능: /me 페이지로 이동
  const handleMyInfo = () => {
    navigate('/me');
  };

  // 현재 경로가 로그인/회원가입 페이지인지 확인
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 왼쪽: 로고 (로그인 전에는 루트(/)로, 후에는 유저 페이지(/user)로 이동) */}
        <Link to={isAuthPage ? "/" : "/user"} className="navbar-logo">
          🍚 DKU BAB
        </Link>

        {/* 오른쪽: 메뉴 버튼들 */}
        <div className="navbar-menu">
          {!isAuthPage ? (
            // [로그인 상태]일 때: 내 정보와 로그아웃 버튼 표시
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
            // [로그아웃 상태]일 때: 로그인과 회원가입 버튼 표시
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