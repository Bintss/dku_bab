// src/pages/OwnerPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function OwnerPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'review'

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '1000px' }}>
            <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>👨‍🍳 관리자 페이지</h1>
            
            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('menu')}
                    style={{
                        padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: activeTab === 'menu' ? '#007bff' : '#888',
                        borderBottom: activeTab === 'menu' ? '3px solid #007bff' : 'none'
                    }}
                >
                    📋 메뉴 관리
                </button>
                <button 
                    onClick={() => setActiveTab('review')}
                    style={{
                        padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: activeTab === 'review' ? '#d32f2f' : '#888',
                        borderBottom: activeTab === 'review' ? '3px solid #d32f2f' : 'none'
                    }}
                >
                    🗣️ 리뷰 관리
                </button>
            </div>

            {/* 탭 내용 */}
            {activeTab === 'menu' ? <MenuManagement /> : <ReviewManagement />}
        </div>
    );
}

// --------------------------------------------------------------------------
// 1. [Sub Component] 메뉴 관리 (CRUD)
// --------------------------------------------------------------------------
function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    // 폼 데이터
    const [formData, setFormData] = useState({ name: '', price: '', description: '', is_sold_out: false });
    const [editId, setEditId] = useState(null); // 수정 모드일 때 ID 저장

    // 메뉴 목록 조회
    const fetchMenus = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/owner/menus/', { withCredentials: true });
            setMenus(response.data);
        } catch (error) {
            console.error("메뉴 로딩 실패:", error);
            alert("데이터를 불러오지 못했습니다. (권한 확인 필요)");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenus(); }, []);

    // 입력 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    // 등록 및 수정 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                // 수정 (PUT)
                await axios.put(`http://localhost:8000/api/owner/menus/${editId}/`, formData, { withCredentials: true });
                alert("메뉴가 수정되었습니다.");
            } else {
                // 등록 (POST)
                // ⚠️ 주의: 백엔드 Serializer가 cafeteria ID를 요구할 수 있습니다. 
                // 현재 코드상 owner 정보를 통해 자동 처리되거나, 백엔드 수정이 필요할 수 있습니다.
                // 여기서는 일단 폼 데이터만 전송합니다.
                await axios.post('http://localhost:8000/api/owner/menus/', formData, { withCredentials: true });
                alert("새 메뉴가 등록되었습니다.");
            }
            setFormData({ name: '', price: '', description: '', is_sold_out: false });
            setEditId(null);
            fetchMenus();
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다. 입력값을 확인해주세요.");
        }
    };

    // 삭제
    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/owner/menus/${id}/`, { withCredentials: true });
            alert("삭제되었습니다.");
            fetchMenus();
        } catch (error) {
            alert("삭제 실패!");
        }
    };

    // 수정 모드 진입
    const handleEditClick = (menu) => {
        setEditId(menu.id);
        setFormData({
            name: menu.name,
            price: menu.price,
            description: menu.description || '',
            is_sold_out: menu.is_sold_out
        });
        window.scrollTo(0, 0); // 폼으로 스크롤 이동
    };

    return (
        <div>
            {/* 입력 폼 */}
            <div className="res-card" style={{ padding: '25px', backgroundColor: '#f8f9fa', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>{editId ? "✏️ 메뉴 수정" : "➕ 새 메뉴 등록"}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" name="name" placeholder="메뉴 이름" required 
                            value={formData.name} onChange={handleChange}
                            style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        />
                        <input 
                            type="number" name="price" placeholder="가격" required 
                            value={formData.price} onChange={handleChange}
                            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        />
                    </div>
                    <input 
                        type="text" name="description" placeholder="메뉴 설명 (선택)" 
                        value={formData.description} onChange={handleChange}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" name="is_sold_out" 
                            checked={formData.is_sold_out} onChange={handleChange}
                        />
                        <span>품절 처리 (Sold Out)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: editId ? '#ffc107' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editId ? "수정 완료" : "메뉴 등록"}
                        </button>
                        {editId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditId(null); setFormData({ name: '', price: '', description: '', is_sold_out: false }); }}
                                style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                취소
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* 메뉴 목록 */}
            <h3>📋 등록된 메뉴 목록 ({menus.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? <div>로딩 중...</div> : menus.map(menu => (
                    <div key={menu.id} className="res-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: menu.is_sold_out ? '5px solid red' : '5px solid #28a745' }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                                {menu.name} {menu.is_sold_out && <span style={{ color: 'red', fontSize: '0.8rem' }}>(품절)</span>}
                            </h4>
                            <p style={{ margin: 0, color: '#666' }}>{menu.price.toLocaleString()}원 <span style={{ color: '#aaa' }}>| 리뷰 {menu.review_count}개</span></p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditClick(menu)} style={{ padding: '6px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                            <button onClick={() => handleDelete(menu.id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                        </div>
                    </div>
                ))}
                {!loading && menus.length === 0 && <p style={{ color: '#888' }}>등록된 메뉴가 없습니다.</p>}
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// 2. [Sub Component] 리뷰 관리 (조회 및 삭제)
// --------------------------------------------------------------------------
function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // 리뷰 목록 조회
    const fetchReviews = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/owner/reviews/', { withCredentials: true });
            setReviews(response.data);
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    // 리뷰 삭제
    const handleDeleteReview = async (id) => {
        if (!window.confirm("이 리뷰를 삭제하시겠습니까? (삭제 후 복구 불가)")) return;
        try {
            await axios.delete(`http://localhost:8000/api/owner/reviews/${id}/`, { withCredentials: true });
            alert("리뷰가 삭제되었습니다.");
            fetchReviews();
        } catch (error) {
            alert("리뷰 삭제 실패!");
        }
    };

    return (
        <div>
            <h3>🚨 리뷰 목록 ({reviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? <div>로딩 중...</div> : reviews.map(review => (
                    <div key={review.id} className="res-card" style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{review.author_name || '익명'}</span>
                                <span style={{ margin: '0 10px', color: '#aaa' }}>|</span>
                                <span style={{ color: '#fbc02d' }}>{'⭐'.repeat(review.rating)}</span>
                            </div>
                            <button 
                                onClick={() => handleDeleteReview(review.id)}
                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                삭제하기
                            </button>
                        </div>
                        <p style={{ margin: '0 0 10px 0', color: '#333' }}>{review.content}</p>
                        {review.image && (
                            <img src={review.image.startsWith('http') ? review.image : `http://localhost:8000${review.image}`} alt="리뷰사진" style={{ maxHeight: '100px', borderRadius: '5px' }} />
                        )}
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                            작성일: {new Date(review.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                {!loading && reviews.length === 0 && <p style={{ color: '#888' }}>접수된 리뷰가 없습니다.</p>}
            </div>
        </div>
    );
}