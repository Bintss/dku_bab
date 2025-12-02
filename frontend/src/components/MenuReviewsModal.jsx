import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MenuReviewsModal({ isOpen, onClose, menu }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // 모달이 열릴 때(isOpen) 해당 메뉴의 리뷰 목록을 서버에서 가져옴
    useEffect(() => {
        if (isOpen && menu) {
            fetchReviews();
        }
    }, [isOpen, menu]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // 백엔드 API 호출: GET /api/menus/<menu_id>/reviews/
            const response = await axios.get(`http://localhost:8000/api/menus/${menu.id}/reviews/`);
            setReviews(response.data);
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !menu) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                {/* 헤더 */}
                <div style={styles.header}>
                    <div>
                        <h2 style={{margin: 0, color: '#333', fontSize: '1.2rem'}}>🗣️ 메뉴 리뷰</h2>
                        <h3 style={{margin: '5px 0 0 0', color: '#007bff', fontSize: '1rem'}}>{menu.name}</h3>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>

                {/* 리뷰 목록 영역 */}
                <div style={styles.body}>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '20px'}}>로딩 중... ⏳</div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} style={styles.reviewCard}>
                                        <div style={styles.reviewHeader}>
                                            {/* 작성자 (백엔드 Serializer에서 author_username 필드 확인 필요) */}
                                            <span style={{fontWeight: 'bold'}}>
                                                {review.author_username || '익명'}
                                            </span>
                                            
                                            {/* 날짜 */}
                                            <span style={{color: '#aaa', fontSize: '0.8rem'}}>
                                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>

                                        {/* 별점 */}
                                        <div style={{marginBottom: '8px', color: '#fbc02d', fontSize: '0.9rem'}}>
                                            {'⭐'.repeat(Math.round(review.rating))}
                                        </div>

                                        {/* 내용 */}
                                        <p style={{margin: 0, color: '#444', lineHeight: '1.4', fontSize: '0.95rem'}}>
                                            {review.content}
                                        </p>

                                        {/* 👇 [추가됨] 이미지 (있을 경우만 표시) */}
                                        {review.image && (
                                            <div style={{marginTop: '10px'}}>
                                                <img 
                                                    // 이미지 경로가 /media/... 로 시작하면 localhost를 붙여줌
                                                    src={review.image.startsWith('http') ? review.image : `http://localhost:8000${review.image}`} 
                                                    alt="포토리뷰" 
                                                    style={{maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover', border: '1px solid #eee'}}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                                    <p>아직 작성된 리뷰가 없습니다.</p>
                                    <p style={{fontSize: '0.8rem'}}>첫 번째 리뷰를 남겨보세요!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={onClose} style={styles.closeButtonFull}>닫기</button>
            </div>
        </div>
    );
}

// 스타일 정의 (CSS-in-JS)
const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    modal: {
        backgroundColor: 'white', padding: '20px', borderRadius: '15px',
        width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'
    },
    closeBtn: {
        background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: '1rem'
    },
    body: {
        flex: 1, overflowY: 'auto'
    },
    reviewCard: {
        backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px',
        border: '1px solid #eee'
    },
    reviewHeader: {
        display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem'
    },
    closeButtonFull: {
        width: '100%', marginTop: '20px', padding: '12px',
        backgroundColor: '#6c757d', color: 'white', border: 'none',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
    }
};