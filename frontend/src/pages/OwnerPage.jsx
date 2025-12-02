// src/pages/OwnerPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default function OwnerPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'review' | 'store'

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '1000px' }}>
            <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>👨‍🍳 관리자 페이지</h1>
            
            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '30px' }}>
                {/* ▼▼▼ [새로 추가된 탭] ▼▼▼ */}
                <button 
                    onClick={() => setActiveTab('store')}
                    style={{
                        padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: activeTab === 'store' ? '#28a745' : '#888',
                        borderBottom: activeTab === 'store' ? '3px solid #28a745' : 'none'
                    }}
                >
                    🏠 가게 설정
                </button>
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
            {activeTab === 'store' && <StoreManagement />} {/* [추가] */}
            {activeTab === 'menu' && <MenuManagement />}
            {activeTab === 'review' && <ReviewManagement />}
        </div>
    );
}

// --------------------------------------------------------------------------
// 3. [Sub Component] 가게 정보 수정 (이미지 포함)
// --------------------------------------------------------------------------
function StoreManagement() {
    const [store, setStore] = useState({
        name: '', description: '', location: '', operating_hours: '', image: null
    });
    const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기용
    const [loading, setLoading] = useState(true);

    // 가게 정보 불러오기
    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/owner/cafeteria/', { withCredentials: true });
                setStore(response.data);
                // 기존 이미지가 있다면 미리보기에 세팅
                if (response.data.image) {
                    setPreviewImage(response.data.image.startsWith('http') ? response.data.image : `http://localhost:8000${response.data.image}`);
                }
            } catch (error) {
                console.error("가게 정보 로딩 실패:", error);
                alert("가게 정보를 불러오지 못했습니다. 식당이 등록되어 있는지 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };
        fetchStoreInfo();
    }, []);

    // 텍스트 입력 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStore({ ...store, [name]: value });
    };

    // 이미지 파일 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStore({ ...store, image: file }); // 전송용 파일 객체 저장
            setPreviewImage(URL.createObjectURL(file)); // 미리보기용 URL 생성
        }
    };

    // 저장 (수정) 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', store.name);
        formData.append('description', store.description);
        formData.append('location', store.location);
        formData.append('operating_hours', store.operating_hours);
        formData.append('is_active', 'true'); 
        
        if (store.image instanceof File) {
            formData.append('image', store.image);
        }

        const csrftoken = getCookie('csrftoken'); 

        try {
            // [변경] PUT 대신 PATCH 사용 (부분 수정)
            await axios.patch('http://localhost:8000/api/owner/cafeteria/', formData, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert("가게 정보가 수정되었습니다!");
        } catch (error) {
            console.error("수정 실패:", error);
            alert("정보 수정에 실패했습니다.");
        }
    };

    if (loading) return <div>가게 정보를 불러오는 중...</div>;

    return (
        <div className="res-card" style={{ padding: '30px', border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <h3>🏠 내 가게 정보 수정</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 이미지 업로드 영역 */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {previewImage ? (
                            <img src={previewImage} alt="가게 대표 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: '#aaa' }}>이미지 없음</span>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>

                {/* 정보 입력 필드 */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>식당 이름</label>
                    <input type="text" name="name" value={store.name} onChange={handleChange} required 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>한줄 소개</label>
                    <textarea name="description" value={store.description} onChange={handleChange} rows="3"
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>위치</label>
                        <input type="text" name="location" value={store.location} onChange={handleChange} 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>운영 시간</label>
                        <input type="text" name="operating_hours" value={store.operating_hours} onChange={handleChange} 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                <button type="submit" style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                    💾 변경 사항 저장하기
                </button>
            </form>
        </div>
    );
}


// --------------------------------------------------------------------------
// 1. [Sub Component] 메뉴 관리 (CRUD)
// --------------------------------------------------------------------------
function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    // 폼 데이터 (텍스트)
    const [formData, setFormData] = useState({ name: '', price: '', description: '', is_sold_out: false });
    
    // [추가] 이미지 관련 state
    const [imageFile, setImageFile] = useState(null);       // 업로드할 파일 객체
    const [previewUrl, setPreviewUrl] = useState(null);     // 미리보기 URL

    const [editId, setEditId] = useState(null);

    // 메뉴 목록 조회
    const fetchMenus = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/owner/menus/', { withCredentials: true });
            setMenus(response.data);
        } catch (error) {
            console.error("메뉴 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenus(); }, []);

    // 텍스트 입력 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    // [추가] 이미지 파일 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 미리보기 생성
        }
    };

    // 등록 및 수정 제출 (FormData 사용)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. FormData 생성
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', parseInt(formData.price, 10));
        data.append('description', formData.description);
        data.append('is_sold_out', formData.is_sold_out);
        data.append('is_active', 'true');
        
        // 이미지가 새로 선택되었을 때만 추가
        if (imageFile) {
            data.append('image', imageFile);
        }

        const csrftoken = getCookie('csrftoken'); // 토큰 가져오기

        try {
            const config = {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'multipart/form-data', // 중요!
                }
            };

            if (editId) {
                // 수정 (PUT -> PATCH가 이미지 수정에 더 안전할 수 있으나, 일단 PUT 유지)
                // 만약 이미지 수정이 안 되면 백엔드 View를 PATCH 지원으로 바꾸거나 여기서 patch 사용
                await axios.put(`http://localhost:8000/api/owner/menus/${editId}/`, data, config);
                alert("메뉴가 수정되었습니다.");
            } else {
                // 등록 (POST)
                await axios.post('http://localhost:8000/api/owner/menus/', data, config);
                alert("새 메뉴가 등록되었습니다.");
            }
            
            // 초기화
            setFormData({ name: '', price: '', description: '', is_sold_out: false });
            setImageFile(null);
            setPreviewUrl(null);
            setEditId(null);
            fetchMenus();

        } catch (error) {
            console.error("저장 실패:", error);
            alert(`저장 실패: ${JSON.stringify(error.response?.data)}`);
        }
    };

    // 삭제
    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) return;
        const csrftoken = getCookie('csrftoken');
        try {
            await axios.delete(`http://localhost:8000/api/owner/menus/${id}/`, { 
                withCredentials: true,
                headers: { 'X-CSRFToken': csrftoken }
            });
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
        
        // 기존 이미지가 있으면 미리보기에 보여주기
        if (menu.image) {
            // http로 시작하면 그대로, 아니면 localhost 붙이기
            setPreviewUrl(menu.image.startsWith('http') ? menu.image : `http://localhost:8000${menu.image}`);
        } else {
            setPreviewUrl(null);
        }
        setImageFile(null); // 파일 객체는 초기화 (새로 올릴 때만 채움)
        
        window.scrollTo(0, 0);
    };

    // 취소 버튼
    const handleCancel = () => {
        setEditId(null);
        setFormData({ name: '', price: '', description: '', is_sold_out: false });
        setImageFile(null);
        setPreviewUrl(null);
    };

    return (
        <div>
            {/* 입력 폼 */}
            <div className="res-card" style={{ padding: '25px', backgroundColor: '#f8f9fa', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>{editId ? "✏️ 메뉴 수정" : "➕ 새 메뉴 등록"}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* [추가] 이미지 업로드 영역 */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#e9ecef', borderRadius: '5px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>📷</span>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

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
                                onClick={handleCancel}
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
                    <div key={menu.id} className="res-card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: menu.is_sold_out ? '5px solid red' : '5px solid #28a745', backgroundColor: '#fff', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* [추가] 목록에 이미지 표시 */}
                            {menu.image && (
                                <img 
                                    src={menu.image.startsWith('http') ? menu.image : `http://localhost:8000${menu.image}`} 
                                    alt={menu.name} 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }}
                                />
                            )}
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                                    {menu.name} {menu.is_sold_out && <span style={{ color: 'red', fontSize: '0.8rem' }}>(품절)</span>}
                                </h4>
                                <p style={{ margin: 0, color: '#666' }}>{menu.price.toLocaleString()}원</p>
                            </div>
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