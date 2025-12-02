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

// Django csrftoken 쿠키를 읽어오는 헬퍼 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

export default function MyPage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingReviewId, setEditingReviewId] = useState(null); // 지금 수정 중인 리뷰 id
    const [editContent, setEditContent] = useState("");           // 수정 중인 내용
    const [editRating, setEditRating] = useState(0);              // 수정 중인 별점
    const [saving, setSaving] = useState(false);                  // 저장 중 로딩 표시

    // 별점을 ⭐로 변환하는 헬퍼 함수
    const renderRatingStars = (rating) => {
        if (typeof rating !== 'number' || rating < 1) return '⭐'.repeat(0);
        return '⭐'.repeat(Math.round(rating));
    };

    // ------------------- 리뷰 수정 모드 헬퍼 함수들 -------------------
    const startEdit = (review) => {
        // 수정 버튼 눌렀을 때 호출
        setEditingReviewId(review.id);
        setEditContent(review.content || "");
        setEditRating(review.rating || 0);
    };

    const cancelEdit = () => {
        // 취소 버튼 눌렀을 때 호출
        setEditingReviewId(null);
        setEditContent("");
        setEditRating(0);
    };

    const handleSaveEdit = async () => {
        // 저장 버튼 눌렀을 때 호출
        if (!editingReviewId) return;
        if (!editContent.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }
        if (editRating <= 0 || editRating > 5) {
            alert("별점은 1~5 사이로 선택해주세요.");
            return;
        }

        try {
            setSaving(true);

            const csrftoken = getCookie("csrftoken");

            const response = await axios.patch(
                `http://localhost:8000/api/reviews/${editingReviewId}/`,
                {
                    content: editContent,
                    rating: editRating,
                },
                {
                withCredentials: true,
                headers: {
                    "X-CSRFToken": csrftoken,
                    },
                }
            );

            const updated = response.data;
            // 로컬 상태에서 해당 리뷰만 업데이트
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === editingReviewId
                        ? {
                              ...r,
                              content: updated.content,
                              rating: updated.rating,
                              created_at: updated.created_at
                                  ? updated.created_at.split("T")[0]
                                  : r.created_at,
                          }
                        : r
                )
            );
            cancelEdit();
            alert("리뷰가 수정되었습니다.");
        } catch (error) {
            console.error("리뷰 수정 실패:", error);
            alert("리뷰 수정에 실패했습니다.");
        } finally {
            setSaving(false);
        }
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
        <div
            className="container"
            style={{ marginTop: "40px", maxWidth: "900px" }}
        >
            {/* 1. 사용자 정보 요약 및 리뷰 수 섹션 */}
            <h1
                style={{
                    borderBottom: "3px solid #007bff",
                    paddingBottom: "10px",
                }}
            >
                👤 내 정보
            </h1>
            <div
                className="res-card"
                style={{
                    padding: "30px",
                    marginBottom: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#f9f9f9",
                }}
            >
                {/* 왼쪽: 아이디 및 상세 정보 */}
                <div style={{ flex: 1 }}>
                    <h2
                        style={{
                            margin: "0 0 10px 0",
                            color: "#333",
                        }}
                    >
                        {userInfo.username}님, 환영합니다!
                    </h2>
                    <p
                        style={{
                            margin: "5px 0",
                            color: "#6c757d",
                        }}
                    >
                        <strong>이메일:</strong> {userInfo.email}
                    </p>
                    <p
                        style={{
                            margin: "5px 0",
                            color: "#6c757d",
                        }}
                    >
                        <strong>가입일:</strong>{" "}
                        {userInfo.member_since || "정보 없음"}
                    </p>
                </div>

                {/* 오른쪽: 내가 쓴 리뷰 수 강조 */}
                <div
                    style={{
                        textAlign: "right",
                        paddingLeft: "30px",
                        borderLeft: "1px solid #eee",
                        flexShrink: 0,
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 5px 0",
                            fontSize: "0.9rem",
                            color: "#666",
                        }}
                    >
                        내가 쓴 리뷰
                    </p>
                    <h3
                        style={{
                            margin: 0,
                            color: "#d32f2f",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                        }}
                    >
                        {reviews.length}개
                    </h3>
                </div>
            </div>
            {/* End of 사용자 정보 및 리뷰 요약 섹션 */}

            {/* 2. 내가 쓴 리뷰 목록 섹션 */}
            <h1
                style={{
                    borderBottom: "3px solid #d32f2f",
                    paddingBottom: "10px",
                    marginTop: "50px",
                }}
            >
                📝 내가 쓴 리뷰 ({reviews.length})
            </h1>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    marginTop: "20px",
                }}
            >
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="res-card"
                            style={{
                                padding: "20px",
                                borderLeft: "5px solid #d32f2f",
                                background: "white",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: "1.1rem",
                                        color: "#333",
                                    }}
                                >
                                    {review.restaurant_name} -{" "}
                                    {review.menu_name}
                                </h3>
                                <span
                                    style={{
                                        color: "#fbc02d",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {renderRatingStars(review.rating)}
                                </span>
                            </div>

                            {editingReviewId === review.id ? (
                                <>
                                    {/* ✏ 수정 모드일 때 */}
                                    <div style={{ margin: "10px 0" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "0.85rem",
                                                color: "#555",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            리뷰 내용
                                        </label>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            rows={3}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                border: "1px solid #ccc",
                                                resize: "vertical",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            margin: "10px 0",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <label
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "#555",
                                                    marginRight: "8px",
                                                }}
                                            >
                                                별점:
                                            </label>
                                            <select
                                                value={editRating}
                                                onChange={(e) =>
                                                    setEditRating(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    border: "1px solid #ccc",
                                                }}
                                            >
                                                <option value={0}>선택</option>
                                                <option value={1}>1점</option>
                                                <option value={2}>2점</option>
                                                <option value={3}>3점</option>
                                                <option value={4}>4점</option>
                                                <option value={5}>5점</option>
                                            </select>
                                        </div>
                                        <div>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={saving}
                                                style={{
                                                    marginRight: "8px",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    border: "none",
                                                    backgroundColor: "#007bff",
                                                    color: "white",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {saving
                                                    ? "저장 중..."
                                                    : "저장"}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    border: "1px solid #ccc",
                                                    backgroundColor: "white",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 👀 일반 보기 모드일 때 */}
                                    <p
                                        style={{
                                            margin: "10px 0",
                                            color: "#555",
                                        }}
                                    >
                                        "{review.content}"
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            fontSize: "0.85rem",
                                            color: "#aaa",
                                        }}
                                    >
                                        <div>
                                            작성일: {review.created_at}
                                        </div>
                                        <button
                                            onClick={() => startEdit(review)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                border: "1px solid #d32f2f",
                                                backgroundColor: "white",
                                                color: "#d32f2f",
                                                cursor: "pointer",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            수정
                                        </button>
                                    </div>
                                </>
                            )}
                            
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
                    <div
                        style={{
                            textAlign: "center",
                            padding: "30px",
                            color: "#888",
                        }}
                    >
                        아직 작성한 리뷰가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
