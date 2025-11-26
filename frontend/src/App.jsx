// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

//(Import)
import Navbar from "./components/Navbar";//추가
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage"; 
import RegisterPage from "./pages/RegisterPage";
import MyPage from "./pages/MyPage"; //추가
import RestaurantDetailPage from "./pages/RestaurantDetailPage"; //추가
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* 접속 시 로그인 페이지 표시 */}
        <Route path="/" element={<LoginPage />} />
        
        {/* 관리자 페이지 연결 */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* 유저 페이지 연결 */}
        <Route path="/user" element={<UserPage />} />

        {/* 회원가입 페이지 연결*/}
        <Route path="/register" element={<RegisterPage />} />

        {/* 내 정보 페이지 연결*/}
        <Route path="/me" element={<MyPage />} /> {/*추가*/}

        {/* 👇 [추가] 상세 페이지 동적 라우트 연결 */}
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}