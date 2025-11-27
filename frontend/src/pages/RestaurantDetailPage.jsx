// src/pages/RestaurantDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 💡 axios import

// --------------------------------------------------------------------------
// 🚨 [통합 지점 1: Mock Data] 백엔드 API 구현 전까지 사용하는 가짜 데이터
// --------------------------------------------------------------------------
const MOCK_CAFETERIAS = [
  {
    id: 1,
    식당이름: "학생회관 식당",
    operating_hours: "09:00 - 18:00",
    avg_rating: 4.5,           
    review_count: 123,         
    menus: [
        { id: 101, name: "등심 돈까스", price: 6500, img: "🍛", reviews: [] },
        { id: 102, name: "치즈 돈까스", price: 7000, img: "🧀", reviews: [] },
        { id: 103, name: "김치 볶음밥", price: 5500, img: "🍳", reviews: [] }
    ]
  },
  {
    id: 2,
    식당이름: "교직원 식당",
    operating_hours: "11:30 - 14:00",
    avg_rating: 3.2,
    review_count: 85,
    menus: [
        { id: 201, name: "갈비탕", price: 9000, img: "🍲", reviews: [] },
        { id: 202, name: "비빔밥", price: 7000, img: "🥗", reviews: [] }
    ]
  },
  {
    id: 3,
    식당이름: "후문 분식",
    operating_hours: "10:00 - 20:00",
    avg_rating: 4.8,
    review_count: 210,
    menus: [
        { id: 301, name: "라볶이", price: 5000, img: "🍜", reviews: [] },
        { id: 302, name: "참치 김밥", price: 4000, img: "🍙", reviews: [] }
    ]
  },
];

// --------------------------------------------------------------------------
// 2. [Main Component] RestaurantDetailPage
// --------------------------------------------------------------------------
export default function RestaurantDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            // ============================================================
            // 🚩 [통합 지점 2: 실제 API 호출 코드] (백엔드 연동 시 주석 해제)
            // ============================================================
            /*
            try {
                const response = await axios.get(`http://localhost:8000/api/restaurant/${id}/`);
                setRestaurant(response.data); // 백엔드가 단일 객체를 준다고 가정
                setLoading(false);
                return; // 성공 시 여기서 종료 (Mock Data 로직 실행 안 함)
            } catch (error) {
                console.error("API 호출 실패 (Mock Data 사용 전환):", error);
                // API 실패 시 아래 Mock 로직으로 넘어감
            }
            */

            // 🚧 [Mock Data 로직] (API 구현 전 테스트용)
            // ------------------------------------------------------------
            const found = MOCK_CAFETERIAS.find(r => r.id === parseInt(id));
            
            // 실제 로딩 느낌을 위해 딜레이 추가
            setTimeout(() => {
                setRestaurant(found);
                setLoading(false);
            }, 300);
        };

        fetchDetail();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>상세 정보 로딩 중...</div>;
    
    if (!restaurant) return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h3>식당 정보를 찾을 수 없습니다.</h3>
            <button onClick={() => navigate('/user')} style={{ padding: '10px 20px', cursor: 'pointer' }}>목록으로 돌아가기</button>
        </div>
    );

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '800px', paddingBottom: '100px' }}>
            <button 
                onClick={() => navigate('/user')} 
                style={{marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
            >
                ← 전체 식당 목록
            </button>
            
            {/* 식당 기본 정보 */}
            <div className="res-card" style={{ display: 'block', padding: '30px', marginBottom: '30px' }}>
                <h1 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px', margin: '0 0 15px 0' }}>
                    {restaurant.식당이름}
                </h1>
                <p style={{fontSize: '1rem', color: '#555'}}><strong>⏰ 영업 시간:</strong> {restaurant.operating_hours}</p>
                <p style={{fontSize: '1rem'}}>
                    <strong>⭐ 평점:</strong> 
                    <span style={{marginLeft: '5px', color: '#fbc02d', fontWeight: 'bold'}}>
                        {restaurant.avg_rating ? restaurant.avg_rating.toFixed(1) : '0.0'}
                    </span>
                    <span style={{marginLeft: '15px', color: '#007bff', fontWeight: 'bold'}}>
                        (리뷰 {restaurant.review_count}개)
                    </span>
                </p>
            </div>

            {/* 메뉴 리스트 */}
            <h2 style={{ fontSize: '1.3rem', marginBottom: '15px', borderLeft: '5px solid #007bff', paddingLeft: '10px', color: '#333' }}>
                🍴 전체 메뉴
            </h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {restaurant.menus && restaurant.menus.map(menu => (
                    <div key={menu.id} className="res-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', background: 'white' }}>
                        
                        {/* 👇 [수정됨] 메뉴 이미지 크기 확대 (100px) */}
                        <div style={{
                            width: '100px', height: '100px',  // 💡 크기 키움
                            backgroundColor: '#f1f3f5', borderRadius: '8px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', 
                            fontSize: '3.5rem', // 💡 아이콘 크기도 키움
                            marginRight: '20px', flexShrink: 0
                        }}>
                            {/* 이미지가 없으면 기본 아이콘 표시 */}
                            {menu.img || "🍽️"}
                        </div>

                        {/* 메뉴 정보 영역 */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                                {menu.name}
                            </span>
                            <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {menu.price.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                ))}
                {(!restaurant.menus || restaurant.menus.length === 0) && (
                    <p style={{color: '#888', textAlign: 'center'}}>등록된 메뉴가 없습니다.</p>
                )}
            </div>
        </div>
    );
}