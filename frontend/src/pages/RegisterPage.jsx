// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });

  // 입력할 때마다 상태 업데이트
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // 1. 유효성 검사
    if (formData.password !== formData.password2) {
      alert("비밀번호가 서로 다릅니다!");
      return;
    }
    if (formData.password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다!");
      return;
    }

    try {
      // 2. 백엔드로 전송
      await axios.post('http://localhost:8000/api/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2
      });

      alert("🎉 회원가입 성공! 로그인해주세요.");
      navigate('/'); // 로그인 화면으로 이동

    } catch (error) {
      // 에러 메시지 처리
      const msg = error.response?.data?.detail || "회원가입 실패";
      alert("❌ " + msg);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>📝 회원가입</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <input 
          name="username" placeholder="아이디" onChange={handleChange}
          style={{ padding: '10px', width: '250px' }}
        />
        <input 
          name="email" type="email" placeholder="이메일 (선택)" onChange={handleChange}
          style={{ padding: '10px', width: '250px' }}
        />
        <input 
          name="password" type="password" placeholder="비밀번호 (8자 이상)" onChange={handleChange}
          style={{ padding: '10px', width: '250px' }}
        />
        <input 
          name="password2" type="password" placeholder="비밀번호 확인" onChange={handleChange}
          style={{ padding: '10px', width: '250px' }}
        />
        
        <button 
          onClick={handleRegister}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}
        >
          가입하기
        </button>
        
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          취소 / 돌아가기
        </button>
      </div>
    </div>
  );
}