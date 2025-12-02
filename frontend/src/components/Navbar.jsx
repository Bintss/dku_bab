import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 유저 정보를 저장할 상태 (null이면 비로그인, 객체면 로그인 상태)
  const [userInfo, setUserInfo] = useState(null);

  // 로그인/회원가입 페이지인지 확인 (이 페이지들에서는 네비게이션 동작을 다르게 하거나 안 보이게 할 때 사용)
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  // 1. 페이지 이동 시마다 내 정보(권한 포함) 가져오기
  useEffect(() => {
    // 로그인/회원가입 페이지가 아닐 때만 API 요청
    if (!isAuthPage) {
      axios.get('http://localhost:8000/api/auth/me/', { withCredentials: true }) // 쿠키(세션) 포함 필수
        .then((response) => {
          // 성공 시: 백엔드에서 준 { is_authenticated, username, is_owner ... } 저장
          if (response.data.is_authenticated) {
            setUserInfo(response.data);
          } else {
            setUserInfo(null);
          }
        })
        .catch((err) => {
          console.log("유저 정보 확인 실패:", err);
          setUserInfo(null);
        });
    }
  }, [location.pathname]); // 경로가 바뀔 때마다 실행 (로그인 직후 반영을 위해)


  // 로그아웃 기능
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout/', {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      setUserInfo(null); // 상태 초기화
      alert("로그아웃 되었습니다 👋");
      navigate('/'); 
    }
  };

  // 내 정보 이동
  const handleMyInfo = () => {
    navigate('/me');
  };

  // 사장님 페이지 이동
  const handleOwnerPage = () => {
    navigate('/owner');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 로고 */}
        <Link to={isAuthPage ? "/" : "/reviews"} className="navbar-logo">
          🍚 DKU BAB
        </Link>

        {/* 메뉴 버튼들 */}
        <div className="navbar-menu">
          {userInfo ? (
            // [로그인 상태]일 때 보이는 버튼들
            <>
              {/* 👇 [핵심] userInfo가 존재하고, is_owner가 true일 때만 버튼 표시 */}
              {userInfo.is_owner && (
                <>
                  <button 
                    onClick={handleOwnerPage} 
                    className="navbar-item" 
                    style={{ color: '#a5d6a7', fontWeight: 'bold' }}
                  >
                    👤 관리자
                  </button>
                  <span style={{color: 'rgba(255,255,255,0.5)', margin: '0 10px'}}>|</span>
                </>
              )}
              
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