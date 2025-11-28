// src/pages/RestaurantDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuReviewsModal from '../components/MenuReviewsModal';
import ReviewModal from '../components/ReviewModal';

export default function RestaurantDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [restaurant, setRestaurant] = useState(null); // 식당 정보
    const [menus, setMenus] = useState([]);             // 메뉴 목록 (평점 포함)
    const [loading, setLoading] = useState(true);

    // 모달 상태 관리
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);

    // 데이터 불러오기 (식당 정보 + 메뉴 목록)
    const fetchDetailData = async () => {
        try {
            // 두 API를 병렬로 호출하여 속도 최적화
            const [resData, menuData] = await Promise.all([
                axios.get(`http://localhost:8000/api/cafeterias/${id}/`),
                axios.get(`http://localhost:8000/api/cafeterias/${id}/menus/`)
            ]);
            
            setRestaurant(resData.data);
            setMenus(menuData.data);
        } catch (error) {
            console.error("상세 정보 로딩 실패:", error);
            alert("정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailData();
    }, [id]);

    // 리뷰 작성 모달 열기
    const handleOpenWriteModal = (e, menu) => {
        e.stopPropagation();
        setSelectedMenu(menu);
        setIsWriteModalOpen(true);
    };

    // 리뷰 보기 모달 열기 (메뉴 클릭 시)
    const handleOpenReadModal = (menu) => {
        setSelectedMenu(menu);
        setIsReadModalOpen(true);
    };

    // 리뷰 제출 처리
    const handleSubmitReview = async (rating, content, imageFile) => {
        const formData = new FormData();
        formData.append('rating', rating);
        formData.append('content', content);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            // 백엔드 URL 규칙에 맞춰 호출 (MenuReviewListCreateAPIView 참고)
            // 백엔드 URL이 /api/menus/<menu_id>/reviews/ 로 가정됨 (백엔드 코드에 따름)
            // 만약 백엔드 urls.py에 정의된 주소가 다르다면 수정 필요
            await axios.post(`http://localhost:8000/api/menu/${selectedMenu.id}/review/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true 
            });
            alert("리뷰가 등록되었습니다!");
            setIsWriteModalOpen(false);
            fetchDetailData(); // 데이터 갱신 (평점 업데이트 확인)
        } catch (error) {
            console.error("리뷰 등록 실패:", error);
            alert("로그인이 필요하거나 오류가 발생했습니다.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>로딩 중... ⏳</div>;
    if (!restaurant) return <div style={{ textAlign: 'center', padding: '50px' }}>식당 정보가 없습니다.</div>;

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '800px', paddingBottom: '100px' }}>
            <button 
                onClick={() => navigate('/user')} 
                style={{marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
            >
                ← 목록으로
            </button>
            
            {/* 1. 식당 기본 정보 */}
            <div className="res-card" style={{ display: 'block', padding: '30px', marginBottom: '30px' }}>
                <h1 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px', margin: '0 0 15px 0' }}>
                    {restaurant.name}
                </h1>
                <p style={{fontSize: '1rem', color: '#555'}}><strong>📍 위치:</strong> {restaurant.location}</p>
                <p style={{fontSize: '1rem', color: '#555'}}><strong>⏰ 영업 시간:</strong> {restaurant.operating_hours}</p>
                <p style={{fontSize: '0.9rem', color: '#888', marginTop:'10px'}}>{restaurant.description}</p>
            </div>

            {/* 2. 메뉴 리스트 */}
            <h2 style={{ fontSize: '1.3rem', marginBottom: '15px', borderLeft: '5px solid #007bff', paddingLeft: '10px', color: '#333' }}>
                🍴 메뉴 목록
            </h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {menus.length > 0 ? (
                    menus.map(menu => (
                        <div 
                            key={menu.id} 
                            className="res-card" 
                            style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor:'pointer' }}
                            onClick={() => handleOpenReadModal(menu)} // 카드 클릭 시 리뷰 보기
                        >
                            <div style={{flex: 1}}>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>{menu.name}</span>
                                    {menu.is_sold_out && <span style={{color:'red', fontSize:'0.8rem', border:'1px solid red', padding:'2px 4px', borderRadius:'4px'}}>품절</span>}
                                </div>
                                <p style={{margin: '5px 0', color: '#666'}}>{menu.price.toLocaleString()}원</p>
                                
                                {/* 평점 및 리뷰 수 표시 (백엔드 MenuSerializer 필드) */}
                                <div style={{fontSize: '0.9rem'}}>
                                    <span style={{color:'#fbc02d', fontWeight:'bold'}}>⭐ {menu.avg_rating ? menu.avg_rating.toFixed(1) : '0.0'}</span>
                                    <span style={{color:'#aaa', marginLeft:'8px'}}> (리뷰 {menu.review_count}개)</span>
                                </div>
                            </div>
                            
                            {/* 리뷰 작성 버튼 */}
                            <button 
                                onClick={(e) => handleOpenWriteModal(e, menu)}
                                style={{
                                    padding: '8px 12px', fontSize: '0.9rem', backgroundColor: '#e3f2fd', 
                                    color: '#1565c0', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                ✍️ 리뷰
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{color: '#888', textAlign: 'center', padding: '20px'}}>등록된 메뉴가 없습니다.</p>
                )}
            </div>

            {/* 모달 컴포넌트 */}
            <MenuReviewsModal 
                isOpen={isReadModalOpen}
                onClose={() => setIsReadModalOpen(false)}
                menu={selectedMenu}
            />
            <ReviewModal 
                isOpen={isWriteModalOpen}
                onClose={() => setIsWriteModalOpen(false)}
                onSubmit={handleSubmitReview}
                menuName={selectedMenu ? selectedMenu.name : ''}
            />
        </div>
    );
}