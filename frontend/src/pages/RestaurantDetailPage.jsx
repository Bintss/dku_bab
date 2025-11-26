// src/pages/RestaurantDetailPage.jsx (새 파일 생성 후 전체 붙여넣기)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ⚠️ [필수] 테스트를 위한 Mock Data (UserPage.jsx와 동일해야 합니다)
const MOCK_CAFETERIAS = [
  {
    id: 1,
    식당이름: "학생회관 식당",
    operating_hours: "09:00 - 18:00",
    avg_rating: 4.5,           
    review_count: 123,         
    menus: [{ id: 101, name: "등심 돈까스", price: 6500, reviews: [] }]
  },
  {
    id: 2,
    식당이름: "교직원 식당",
    operating_hours: "11:30 - 14:00",
    avg_rating: 3.2,
    review_count: 85,
    menus: [{ id: 201, name: "갈비탕", price: 9000, reviews: [] }]
  },
  {
    id: 3,
    식당이름: "후문 분식",
    operating_hours: "10:00 - 20:00",
    avg_rating: 4.8,
    review_count: 210,
    menus: [{ id: 301, name: "라볶이", price: 5000, reviews: [] }]
  },
];
// ⚠️ 주의: 백엔드 구현 완료 시 이 배열은 삭제하고 API 호출로 대체해야 합니다.

export default function RestaurantDetailPage() {
    const { id } = useParams(); // URL에서 식당 ID 가져오기
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // [현재 Mock Data를 사용하는 테스트 로직]
        const mockFetch = () => {
            const found = MOCK_CAFETERIAS.find(r => r.id === parseInt(id)); 
            setRestaurant(found);
            setLoading(false);
        };
        mockFetch();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>상세 정보 로딩 중...</div>;
    if (!restaurant) return <div style={{ textAlign: 'center', padding: '50px' }}>식당 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '800px' }}>
            <button onClick={() => navigate('/user')} style={{marginBottom: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                목록으로 돌아가기
            </button>
            
            {/* 1. 기본 정보 (별점, 리뷰 개수 포함) */}
            <div className="res-card" style={{ display: 'block', padding: '30px' }}>
                <h1 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                    {restaurant.식당이름}
                </h1>
                <p><strong>영업 시간:</strong> {restaurant.operating_hours}</p>
                <p>
                    <strong>평가:</strong> 
                    <span style={{marginLeft: '10px', color: '#fbc02d'}}>
                        ⭐ {restaurant.avg_rating ? restaurant.avg_rating.toFixed(1) : '평가없음'} / 5.0
                    </span>
                    <span style={{marginLeft: '20px'}}>
                        📝 리뷰 {restaurant.review_count !== undefined ? restaurant.review_count.toLocaleString() : 0}개
                    </span>
                </p>
            </div>

            {/* 2. 메뉴 목록 */}
            <h2 style={{ marginTop: '40px', borderLeft: '5px solid #007bff', paddingLeft: '10px' }}>전체 메뉴</h2>
            <div style={{ marginTop: '20px' }}>
                {restaurant.menus && restaurant.menus.map(menu => (
                    <div key={menu.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontWeight: 'bold' }}>{menu.name}</span>
                        <span>{menu.price}원</span>
                    </div>
                ))}
            </div>

            {/* 3. 리뷰 목록 (구현 예정) */}
            <h2 style={{ marginTop: '40px', borderLeft: '5px solid #d32f2f', paddingLeft: '10px' }}>리뷰</h2>
            <p>리뷰 목록과 작성 폼은 이곳에 구현됩니다.</p>

        </div>
    );
}