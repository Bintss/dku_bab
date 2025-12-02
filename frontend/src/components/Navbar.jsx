// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  // 로그아웃 기능
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout/');
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      alert("로그아웃 되었습니다 👋");
      navigate('/'); 
    }
  };

  // 내 정보 이동
  const handleMyInfo = () => {
    navigate('/me');
  };

  // 👇 [추가] 사장님 페이지 이동 함수
  const handleOwnerPage = () => {
    navigate('/owner');
  };

  // 로그인/회원가입 페이지인지 확인
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 로고 */}
        <Link to={isAuthPage ? "/" : "/user"} className="navbar-logo">
          🍚 DKU BAB
        </Link>

        {/* 메뉴 버튼들 */}
        <div className="navbar-menu">
          {!isAuthPage ? (
            // [로그인 상태]일 때 보이는 버튼들
            <>
              {/* 👇 사장님 페이지 버튼 (테스트를 위해 모든 로그인 유저에게 표시) */}
              <button 
                onClick={handleOwnerPage} 
                className="navbar-item" 
                style={{ color: '#a5d6a7', fontWeight: 'bold' }}
              >
                👤 관리자
              </button>
              
              <span style={{color: 'rgba(255,255,255,0.5)', margin: '0 10px'}}>|</span>
              
              <button onClick={handleMyInfo} className="navbar-item">
                👤 내 정보
              </button>
              
              <span style={{color: 'rgba(255,255,255,0.5)', margin: '0 10px'}}>|</span>
              
              <button onClick={handleLogout} className="navbar-item">
                로그아웃
              </button>
            </>
          ) : (
            // [로그아웃 상태]일 때 보이는 버튼들
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