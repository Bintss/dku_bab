// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

//  1. 파일에서 불러오도록 수정 (Import)
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage"; 
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 접속 시 로그인 페이지 표시 */}
        <Route path="/" element={<LoginPage />} />
        
        {/* 관리자 페이지 연결 */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* 유저 페이지 연결 */}
        <Route path="/user" element={<UserPage />} />

        {/* 회원가입 페이지 연결*/}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}