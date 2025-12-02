// src/pages/MyPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --------------------------------------------------------------------------
// 🚨 [Mock Data] 현재 테스트용으로 사용됩니다.
// --------------------------------------------------------------------------
/*const MOCK_USER_DATA = {
    username: "testuser",
    email: "test@dankook.ac.kr",
    member_since: "2025.11.20",
    reviews: [
        { id: 1, restaurant_name: "학생회관 식당", menu_name: "돈까스", rating: 5, content: "바삭하고 양이 많았어요!", created_at: "2025-11-20" },
        { id: 2, restaurant_name: "교직원 식당", menu_name: "갈비탕", rating: 4, content: "국물이 시원했습니다.", created_at: "2025-11-21" },
    ]
};*/


export default function MyPage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // 별점을 ⭐로 변환하는 헬퍼 함수
    const renderRatingStars = (rating) => {
        if (typeof rating !== 'number' || rating < 1) return '⭐'.repeat(0);
        return '⭐'.repeat(Math.round(rating));
    };

    // --------------------------------------------------------------------------
    // 🚩 [API 호출 로직]
    // --------------------------------------------------------------------------
    useEffect(() => {
        const fetchMyInfoAndReviews = async () => {
            // ============================================================
            // ⚠️ [REAL API Code] 백엔드 연동 시 아래 주석을 해제하고 Mock Data 로직을 삭제합니다.
            // ============================================================
            
            try {
                const [userResponse, reviewsResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/auth/me/', { withCredentials: true }),
                    axios.get('http://localhost:8000/api/reviews/my/', { withCredentials: true })
                ]);
                
                setUserInfo(userResponse.data);
                const formattedReviews = reviewsResponse.data.map(review => ({
                    id: review.id,
                    rating: review.rating,
                    content: review.content,
                    created_at: review.created_at ? review.created_at.split('T')[0] : '날짜 없음',
                    menu_name: review.menu?.name || '알 수 없는 메뉴',
                    restaurant_name: review.menu?.cafeteria?.name || '알 수 없는 식당',
                }));
                setReviews(formattedReviews);
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    alert("서버와 연결할 수 없습니다. (Network Error)\n\n1. 백엔드 서버(Docker)가 켜져 있는지 확인하세요.\n2. 브라우저 주소창에 'http://localhost:8000/admin'이 접속 되는지 확인하세요.");
                } else if (error.response && error.response.status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate('/'); 
                } else {
                    alert("정보를 불러오는데 실패했습니다.");
                }
            } finally {
                setLoading(false);
            }
            

            // 🚧 [Mock Data Logic] 현재 프론트엔드 테스트용 (활성)
            // ------------------------------------------------------------
            /*setTimeout(() => {
                setUserInfo(MOCK_USER_DATA);
                setReviews(MOCK_USER_DATA.reviews);
                setLoading(false);
            }, 500);*/

        };

        fetchMyInfoAndReviews();
    }, [navigate]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터 로딩 중... ⏳</div>;
    if (!userInfo) return <div style={{ textAlign: 'center', padding: '50px', color: '#e74c3c' }}>사용자 정보를 불러올 수 없습니다.</div>;

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '900px' }}>
            
            {/* 1. 사용자 정보 요약 및 리뷰 수 섹션 */}
            <h1 style={{ borderBottom: '3px solid #007bff', paddingBottom: '10px' }}>👤 내 정보</h1>
            <div className="res-card" style={{ 
                padding: '30px', 
                marginBottom: '40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#f9f9f9'
            }}>
                
                {/* 왼쪽: 아이디 및 상세 정보 */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {userInfo.username}님, 환영합니다!
                    </h2>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}><strong>이메일:</strong> {userInfo.email}</p>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}><strong>가입일:</strong> {userInfo.member_since || '정보 없음'}</p>
                </div>
                
                {/* 오른쪽: 내가 쓴 리뷰 수 강조 */}
                <div style={{ 
                    textAlign: 'right', 
                    paddingLeft: '30px', 
                    borderLeft: '1px solid #eee',
                    flexShrink: 0
                }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>내가 쓴 리뷰</p>
                    <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {reviews.length}개
                    </h3>
                </div>

            </div>
            {/* End of 사용자 정보 및 리뷰 요약 섹션 */}


            {/* 2. 내가 쓴 리뷰 목록 섹션 */}
            <h1 style={{ borderBottom: '3px solid #d32f2f', paddingBottom: '10px', marginTop: '50px' }}>
                📝 내가 쓴 리뷰 ({reviews.length})
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div 
                            key={review.id} 
                            className="res-card"
                            style={{ padding: '20px', borderLeft: '5px solid #d32f2f', background: 'white' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                                    {review.restaurant_name} - {review.menu_name}
                                </h3>
                                <span style={{ color: '#fbc02d', fontWeight: 'bold' }}>
                                    {renderRatingStars(review.rating)}
                                </span>
                            </div>
                            
                            <p style={{ margin: '10px 0', color: '#555' }}>
                                "{review.content}"
                            </p>

                            {/* 👇 [추가됨] 리뷰 이미지 표시 로직 */}
                            {review.image && (
                                <div style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
                                    <img 
                                        // 💡 경로 처리: 상대 경로일 경우 localhost:8000/media/ 를 붙여 프론트에서 접근 가능하게 함
                                        src={review.image.startsWith('http') ? review.image : `http://localhost:8000${review.image}`} 
                                        alt="리뷰 사진" 
                                        style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '200px', 
                                            borderRadius: '8px', 
                                            objectFit: 'cover', 
                                            border: '1px solid #eee' 
                                        }} 
                                    />
                                </div>
                            )}

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