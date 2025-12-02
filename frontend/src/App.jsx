// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import MyPage from "./pages/MyPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import OwnerPage from "./pages/OwnerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/me" element={<MyPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} /> 
        {/* 3. [추가] owner 페이지 연결 */}
        <Route path="/owner" element={<OwnerPage />} />
      </Routes>
    </BrowserRouter>
  );
}