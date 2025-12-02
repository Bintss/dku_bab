// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 1. 백엔드(Django)로 로그인 요청
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username: username,
        password: password
      });

      console.log("로그인 응답:", response.data);

      // 2. is_staff 값에 따라 페이지 이동
      const { is_staff, username: user } = response.data;

      if (is_staff === true) {
        alert(`관리자(${user})님 환영합니다!`);
        navigate('/admin'); // 빨간 방으로 이동
      } else {
        alert(`일반 유저(${user})님 반갑습니다!`);
        navigate('/user');  // 파란 방으로 이동
      }

    } catch (error) {
      console.error(error);
      // 백엔드가 보낸 에러 메시지(detail) 띄우기
      const msg = error.response?.data?.detail || "로그인 실패";
      alert("❌ " + msg);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🔐 로그인</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <input 
          placeholder="아이디" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ padding: '10px', width: '250px' }}
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ padding: '10px', width: '250px' }}
        />
        <button 
          onClick={handleLogin}
          style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          로그인 하기
        </button>
        
        <button 
          onClick={() => navigate('/register')}
          style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', cursor: 'pointer' }}
        >
          계정이 없나요? 회원가입
        </button>
      </div>
    </div>
  );
}