// frontend/src/pages/OwnerPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // 필요하면 나중에 사용

// ===== CSRF & Axios 공용 설정 =====

// document.cookie에서 특정 이름의 쿠키 값을 가져오는 헬퍼 함수
function getCookie(name) {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
        const cookie = cookies[i].trim();
        // 쿠키가 "name=value" 형식인지 확인
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

// 백엔드와 통신할 때 사용할 axios 인스턴스
const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
});

// 모든 요청에 공통으로 CSRF 헤더를 붙여주는 인터셉터
api.interceptors.request.use((config) => {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
    }
    return config;
});

export default function OwnerPage() {
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'review'

    // 페이지 들어올 때 CSRF 토큰 초기화
    useEffect(() => {
        api.get('/api/csrf/').catch((error) => {
            console.error('CSRF 토큰 초기화 실패:', error);
        });
    }, []);

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '1000px' }}>
            <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>👨‍🍳 관리자 페이지</h1>

            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('menu')}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'menu' ? '#007bff' : '#888',
                        borderBottom: activeTab === 'menu' ? '3px solid #007bff' : 'none',
                    }}
                >
                    📋 메뉴 관리
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'review' ? '#d32f2f' : '#888',
                        borderBottom: activeTab === 'review' ? '3px solid #d32f2f' : 'none',
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
// 1. 메뉴 관리 (식당 선택 + 이미지 업로드 포함)
// --------------------------------------------------------------------------
function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [myCafeterias, setMyCafeterias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        cafeteria: '',
        name: '',
        price: '',
        description: '',
        is_sold_out: false,
        image: null, // File 또는 null
    });
    const [editId, setEditId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // 초기 데이터 로딩: 메뉴 목록 + 식당 목록
    const fetchData = async () => {
        try {
            const [menuRes, cafeRes] = await Promise.all([
                api.get('/api/owner/menus/'),
                api.get('/api/cafeterias/'),
            ]);
            setMenus(menuRes.data);
            setMyCafeterias(cafeRes.data);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            if (error.response && error.response.status === 403) {
                alert('접근 권한이 없습니다. (로그인 필요)');
            } else {
                alert('데이터를 불러오지 못했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 입력 핸들러 (텍스트/체크박스/파일)
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files && files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file || null,
            }));
            if (file) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            cafeteria: '',
            name: '',
            price: '',
            description: '',
            is_sold_out: false,
            image: null,
        });
        setEditId(null);
        setPreviewUrl(null);
        const fileInput = document.getElementById('menuImageInput');
        if (fileInput) fileInput.value = '';
    };

    // 등록/수정 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.cafeteria) {
            alert('메뉴를 등록할 식당을 선택해주세요.');
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('cafeteria', formData.cafeteria);
        dataToSend.append('name', formData.name);
        dataToSend.append('price', formData.price);
        dataToSend.append('description', formData.description);
        dataToSend.append('is_sold_out', formData.is_sold_out ? 'true' : 'false');

        // 새로 선택된 이미지 파일만 전송
        if (formData.image instanceof File) {
            dataToSend.append('image', formData.image);
        }

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };

        try {
            if (editId) {
                await api.put(`/api/owner/menus/${editId}/`, dataToSend, config);
                alert('메뉴가 수정되었습니다.');
            } else {
                await api.post('/api/owner/menus/', dataToSend, config);
                alert('새 메뉴가 등록되었습니다.');
            }
            resetForm();
            fetchData();
        } catch (error) {
            console.error('저장 실패:', error);
            if (error.response && error.response.status === 403) {
                alert('권한이 없습니다. 본인의 식당에만 메뉴를 등록할 수 있습니다.');
            } else if (error.response && error.response.data) {
                alert('저장에 실패했습니다.\n' + JSON.stringify(error.response.data));
            } else {
                alert('저장에 실패했습니다. 입력값을 확인해주세요.');
            }
        }
    };

    // 삭제
    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/api/owner/menus/${id}/`);
            alert('삭제되었습니다.');
            fetchData();
        } catch (error) {
            console.error('삭제 실패:', error);
            if (error.response && error.response.status === 403) {
                alert('삭제 권한이 없습니다.');
            } else {
                alert('삭제 실패!');
            }
        }
    };

    // 수정 모드 진입
    const handleEditClick = (menu) => {
        const cafeteriaId =
            typeof menu.cafeteria === 'object' && menu.cafeteria !== null
                ? menu.cafeteria.id
                : menu.cafeteria;

        setEditId(menu.id);
        setFormData({
            cafeteria: cafeteriaId || '',
            name: menu.name,
            price: menu.price,
            description: menu.description || '',
            is_sold_out: menu.is_sold_out,
            image: menu.image || null,
        });

        setPreviewUrl(menu.image || null);

        const fileInput = document.getElementById('menuImageInput');
        if (fileInput) fileInput.value = '';

        window.scrollTo(0, 0);
    };

    return (
        <div>
            {/* 입력 폼 */}
            <div
                className="res-card"
                style={{ padding: '25px', backgroundColor: '#f8f9fa', marginBottom: '30px' }}
            >
                <h3 style={{ marginTop: 0 }}>{editId ? '✏️ 메뉴 수정' : '➕ 새 메뉴 등록'}</h3>
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                    {/* 식당 선택 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>식당 선택</label>
                        <select
                            name="cafeteria"
                            value={formData.cafeteria}
                            onChange={handleChange}
                            disabled={!!editId} // 수정 모드에서는 식당 변경 불가
                            style={{
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                            }}
                            required
                        >
                            <option value="">-- 식당을 선택하세요 --</option>
                            {myCafeterias.map((cafe) => (
                                <option key={cafe.id} value={cafe.id}>
                                    {cafe.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            name="name"
                            placeholder="메뉴 이름"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                flex: 2,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                            }}
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="가격"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                            }}
                        />
                    </div>

                    <input
                        type="text"
                        name="description"
                        placeholder="메뉴 설명 (선택)"
                        value={formData.description}
                        onChange={handleChange}
                        style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                        }}
                    />

                    {/* 이미지 업로드 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold' }}>메뉴 사진 (선택)</label>
                        <input
                            id="menuImageInput"
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            style={{
                                padding: '5px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                backgroundColor: 'white',
                            }}
                        />
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={previewUrl}
                                    alt="미리보기"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '5px',
                                        border: '1px solid #ddd',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <input
                            type="checkbox"
                            name="is_sold_out"
                            checked={formData.is_sold_out}
                            onChange={handleChange}
                        />
                        <span>품절 처리 (Sold Out)</span>
                    </label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: editId ? '#ffc107' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            {editId ? '수정 완료' : '메뉴 등록'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
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
                {loading ? (
                    <div>로딩 중...</div>
                ) : (
                    menus.map((menu) => (
                        <div
                            key={menu.id}
                            className="res-card"
                            style={{
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: menu.is_sold_out
                                    ? '5px solid red'
                                    : '5px solid #28a745',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                {/* 이미지 */}
                                {menu.image ? (
                                    <img
                                        src={menu.image}
                                        alt={menu.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #eee',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundColor: '#eee',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#888',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        No Image
                                    </div>
                                )}

                                <div>
                                    <small style={{ color: '#888', fontWeight: 'bold' }}>
                                        [{menu.cafeteria_name || '식당정보 없음'}]
                                    </small>
                                    <h4
                                        style={{
                                            margin: '5px 0 5px 0',
                                            fontSize: '1.1rem',
                                        }}
                                    >
                                        {menu.name}{' '}
                                        {menu.is_sold_out && (
                                            <span
                                                style={{
                                                    color: 'red',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                (품절)
                                            </span>
                                        )}
                                    </h4>
                                    <p style={{ margin: 0, color: '#666' }}>
                                        {Number(menu.price).toLocaleString()}원{' '}
                                        <span style={{ color: '#aaa' }}>
                                            | 리뷰 {menu.review_count}개
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleEditClick(menu)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#ffc107',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(menu.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {!loading && menus.length === 0 && (
                    <p style={{ color: '#888' }}>등록된 메뉴가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// 2. 리뷰 관리
// --------------------------------------------------------------------------
function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/api/owner/reviews/');
            setReviews(response.data);
        } catch (error) {
            console.error('리뷰 로딩 실패:', error);
            if (error.response && error.response.status === 403) {
                alert('권한이 없습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteReview = async (id) => {
        if (!window.confirm('이 리뷰를 삭제하시겠습니까? (삭제 후 복구 불가)')) return;
        try {
            await api.delete(`/api/owner/reviews/${id}/`);
            alert('리뷰가 삭제되었습니다.');
            fetchReviews();
        } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            if (error.response && error.response.status === 403) {
                alert('삭제 권한이 없습니다.');
            } else {
                alert('리뷰 삭제 실패!');
            }
        }
    };

    return (
        <div>
            <h3>🚨 리뷰 목록 ({reviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? (
                    <div>로딩 중...</div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="res-card"
                            style={{
                                padding: '20px',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffeeba',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                }}
                            >
                                <div>
                                    {review.cafeteria_name && (
                                        <span
                                            style={{
                                                marginRight: '10px',
                                                fontWeight: 'bold',
                                                color: '#555',
                                            }}
                                        >
                                            [{review.cafeteria_name}]
                                        </span>
                                    )}
                                    <span style={{ fontWeight: 'bold' }}>
                                        {review.author_name || '익명'}
                                    </span>
                                    <span
                                        style={{
                                            margin: '0 10px',
                                            color: '#aaa',
                                        }}
                                    >
                                        |
                                    </span>
                                    <span style={{ color: '#fbc02d' }}>
                                        {'⭐'.repeat(review.rating)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    삭제하기
                                </button>
                            </div>
                            <p
                                style={{
                                    margin: '0 0 10px 0',
                                    color: '#333',
                                }}
                            >
                                {review.content}
                            </p>
                            {review.image && (
                                <img
                                    src={
                                        review.image.startsWith('http')
                                            ? review.image
                                            : `http://localhost:8000${review.image}`
                                    }
                                    alt="리뷰사진"
                                    style={{
                                        maxHeight: '100px',
                                        borderRadius: '5px',
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    textAlign: 'right',
                                    fontSize: '0.8rem',
                                    color: '#888',
                                    marginTop: '5px',
                                }}
                            >
                                작성일:{' '}
                                {new Date(review.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
                {!loading && reviews.length === 0 && (
                    <p style={{ color: '#888' }}>접수된 리뷰가 없습니다.</p>
                )}
            </div>
        </div>
    );
}