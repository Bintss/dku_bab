// src/pages/MyPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ⚠️ 백엔드 API가 구현되기 전까지 사용할 Mock Data입니다.
const MOCK_USER = {
    username: "testuser123",
    email: "test@dankook.ac.kr",
    member_since: "2023.01.01",
};

const MOCK_REVIEWS = [
    {
        id: 1,
        restaurant_name: "학생회관 식당", // 리뷰 대상 식당 이름
        menu_name: "등심 돈까스",         // 리뷰 대상 메뉴 이름
        rating: 5,
        content: "돈까스가 바삭하고 양이 많아서 좋았어요! 소스도 맛있습니다.",
        created_at: "2025.11.20",
    },
    {
        id: 2,
        restaurant_name: "후문 분식",
        menu_name: "라볶이",
        rating: 4,
        content: "라볶이 양념이 매콤달콤해서 좋았습니다. 떡이 좀 더 쫄깃했으면 좋겠어요.",
        created_at: "2025.11.15",
    },
    {
        id: 3,
        restaurant_name: "교직원 식당",
        menu_name: "갈비탕",
        rating: 3,
        content: "고기는 부드러웠으나, 국물이 조금 밍밍했습니다. 가성비는 괜찮은 편입니다.",
        created_at: "2025.11.01",
    },
];
// ⚠️ 주의: 실제 구현 시에는 이 Mock Data는 삭제하고 API 호출로 대체해야 합니다.


export default function MyPage() {
    const [user, setUser] = useState(MOCK_USER);
    const [reviews, setReviews] = useState(MOCK_REVIEWS); // 💡 리뷰 상태 추가
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 백엔드 개발자에게 넘길 최종 버전에서는 Mock 데이터를 지우고 아래 코드를 사용합니다.
        // 현재는 API가 없으므로 Mock 데이터를 바로 사용합니다.
        
        // ❌ 실제 API 호출 (백엔드 구현 후 사용)
        // const fetchMyReviews = async () => {
        //     setLoading(true);
        //     try {
        //         // 백엔드는 인증(Authorization 헤더)을 통해 현재 로그인 유저의 리뷰를 반환해야 합니다.
        //         const reviewResponse = await axios.get('http://localhost:8000/api/my/reviews/');
        //         setReviews(reviewResponse.data.reviews); 
        //         
        //         // 사용자 정보 API는 이미 구현되어 있다고 가정합니다.
        //         // const userResponse = await axios.get('http://localhost:8000/api/user/info/');
        //         // setUser(userResponse.data);
        //     } catch (error) {
        //         console.error("내 정보 및 리뷰 로딩 에러:", error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchMyReviews();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터 로딩 중...</div>;


    // 별점을 ⭐로 변환하는 헬퍼 함수
    const renderRatingStars = (rating) => {
        return '⭐'.repeat(rating);
    };

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '900px' }}>
            {/* 1. 사용자 정보 및 리뷰 요약 섹션 (수정된 부분) */}
            <h1 style={{ borderBottom: '3px solid #007bff', paddingBottom: '10px' }}>👤 내 정보</h1>
            <div className="res-card" style={{ 
                padding: '30px', 
                marginBottom: '40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#f9f9f9' // 배경색 추가로 강조
            }}>
                
                {/* 왼쪽: 아이디 및 상세 정보 */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {user.username}님
                    </h2>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}><strong>이메일:</strong> {user.email}</p>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}><strong>가입일:</strong> {user.member_since}</p>
                </div>
                
                {/* 오른쪽: 내가 쓴 리뷰 수 (강조) */}
                <div style={{ 
                    textAlign: 'right', 
                    paddingLeft: '30px', 
                    borderLeft: '1px solid #eee',
                    flexShrink: 0 // 내용이 줄어들지 않도록 설정
                }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>내가 쓴 리뷰</p>
                    <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {reviews.length}개
                    </h3>
                </div>

            </div>

            {/* 2. 내가 쓴 리뷰 목록 섹션 💡 새로 추가된 부분 */}
            <h1 style={{ borderBottom: '3px solid #d32f2f', paddingBottom: '10px', marginTop: '50px' }}>📝 내가 쓴 리뷰 ({reviews.length})</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div 
                            key={review.id} 
                            className="res-card"
                            style={{ padding: '20px', borderLeft: '5px solid #d32f2f' }}
                        >
                            {/* 리뷰 상단 정보: 식당, 메뉴, 별점 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                                    {review.restaurant_name} - {review.menu_name}
                                </h3>
                                <span style={{ color: '#fbc02d', fontWeight: 'bold' }}>
                                    {renderRatingStars(review.rating)}
                                </span>
                            </div>
                            
                            {/* 리뷰 내용 */}
                            <p style={{ margin: '10px 0', color: '#555' }}>
                                "{review.content}"
                            </p>
                            
                            {/* 작성일 */}
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#aaa' }}>
                                작성일: {review.created_at}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        아직 작성한 리뷰가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}