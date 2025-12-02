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
// 1. [Sub Component] 메뉴 관리 (이미지 업로드 기능 추가됨)
// --------------------------------------------------------------------------
function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [myCafeterias, setMyCafeterias] = useState([]); 
    const [loading, setLoading] = useState(true);

    // 폼 데이터 (image 필드 추가)
    const [formData, setFormData] = useState({ 
        cafeteria: '', 
        name: '', 
        price: '', 
        description: '', 
        is_sold_out: false,
        image: null // [New] 이미지 파일 객체 저장용
    });
    const [editId, setEditId] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null); // [New] 미리보기 URL

    // 초기 데이터 로딩
    const fetchData = async () => {
        try {
            // 메뉴 목록 조회
            const menuRes = await axios.get('http://localhost:8000/api/owner/menus/', { withCredentials: true });
            setMenus(menuRes.data);

            // 내 식당 목록 조회 (식당 선택용)
            // 주의: 백엔드에 본인 소유 식당만 리턴하는 API(/api/owner/cafeterias/)가 필요할 수 있음.
            // 일단 전체 식당 API를 호출한다고 가정합니다.
            const cafeRes = await axios.get('http://localhost:8000/api/cafeterias/', { withCredentials: true });
            
            // (임시) 실제로는 백엔드에서 owner 필터링된 리스트를 주는 것이 가장 좋음
            setMyCafeterias(cafeRes.data);

        } catch (error) {
            console.error("데이터 로딩 실패:", error);
            if (error.response && error.response.status === 403) {
                 alert("접근 권한이 없습니다. (로그인 필요)");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // [수정] 입력 핸들러 (파일 처리 로직 추가)
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            // 파일 입력인 경우
            const file = files[0];
            setFormData({ ...formData, [name]: file });
            
            // 미리보기 URL 생성
            if (file) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        } else {
            // 일반 입력인 경우
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    // [수정] 등록 및 수정 제출 (FormData 사용)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.cafeteria) {
            alert("메뉴를 등록할 식당을 선택해주세요.");
            return;
        }

        // ▼▼▼ 핵심: FormData 객체 생성 ▼▼▼
        // 이미지를 보내려면 JSON이 아닌 FormData를 써야 합니다.
        const dataToSend = new FormData();
        dataToSend.append('cafeteria', formData.cafeteria);
        dataToSend.append('name', formData.name);
        dataToSend.append('price', formData.price);
        dataToSend.append('description', formData.description);
        dataToSend.append('is_sold_out', formData.is_sold_out);
        
        // 이미지가 "새로 선택된 경우(File 객체)"에만 append
        if (formData.image instanceof File) {
             dataToSend.append('image', formData.image);
        }

        // 헤더 설정 (multipart/form-data)
        const config = {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        };

        try {
            if (editId) {
                // 수정 (PUT)
                await axios.put(`http://localhost:8000/api/owner/menus/${editId}/`, dataToSend, config);
                alert("메뉴가 수정되었습니다.");
            } else {
                // 등록 (POST)
                await axios.post('http://localhost:8000/api/owner/menus/', dataToSend, config);
                alert("새 메뉴가 등록되었습니다.");
            }
            
            resetForm(); // 폼 초기화
            fetchData(); // 목록 갱신

        } catch (error) {
            console.error("저장 실패:", error);
            if (error.response && error.response.status === 403) {
                alert("권한이 없습니다. 본인의 식당에만 메뉴를 등록할 수 있습니다.");
            } else {
                alert("저장에 실패했습니다.");
            }
        }
    };

    // 폼 초기화 함수
    const resetForm = () => {
        setFormData({ cafeteria: '', name: '', price: '', description: '', is_sold_out: false, image: null });
        setEditId(null);
        setPreviewUrl(null);
        // 파일 input 초기화 (ID 사용)
        const fileInput = document.getElementById('menuImageInput');
        if(fileInput) fileInput.value = '';
    };

    // 삭제
    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/owner/menus/${id}/`, { withCredentials: true });
            alert("삭제되었습니다.");
            fetchData();
        } catch (error) {
             if (error.response && error.response.status === 403) {
                alert("삭제 권한이 없습니다.");
            } else {
                alert("삭제 실패!");
            }
        }
    };

    // 수정 모드 진입
    const handleEditClick = (menu) => {
        setEditId(menu.id);
        setFormData({
            cafeteria: menu.cafeteria,
            name: menu.name,
            price: menu.price,
            description: menu.description || '',
            is_sold_out: menu.is_sold_out,
            image: menu.image // 기존 이미지 경로(string) 저장
        });
        
        // 기존 이미지가 있다면 미리보기에 세팅
        // 백엔드 URL이 절대경로가 아닐 경우를 대비해 처리 (보통 DRF는 절대경로 줌)
        setPreviewUrl(menu.image); 
        
        // 파일 인풋 값 비우기
        const fileInput = document.getElementById('menuImageInput');
        if(fileInput) fileInput.value = '';

        window.scrollTo(0, 0); 
    };

    return (
        <div>
            {/* 입력 폼 */}
            <div className="res-card" style={{ padding: '25px', backgroundColor: '#f8f9fa', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>{editId ? "✏️ 메뉴 수정" : "➕ 새 메뉴 등록"}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* 식당 선택 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>식당 선택</label>
                        <select 
                            name="cafeteria" 
                            value={formData.cafeteria} 
                            onChange={handleChange}
                            disabled={!!editId} 
                            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                            required
                        >
                            <option value="">-- 식당을 선택하세요 --</option>
                            {myCafeterias.map(cafe => (
                                <option key={cafe.id} value={cafe.id}>
                                    {cafe.name}
                                </option>
                            ))}
                        </select>
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

                    {/* [New] 파일 업로드 필드 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold' }}>메뉴 사진 (선택)</label>
                        <input 
                            id="menuImageInput"
                            type="file" 
                            name="image" 
                            accept="image/*" 
                            onChange={handleChange}
                            style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}
                        />
                        {/* 미리보기 이미지 */}
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={previewUrl} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>

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
                                onClick={resetForm}
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
                        
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {/* [New] 리스트에 이미지 표시 */}
                            {menu.image ? (
                                <img 
                                    src={menu.image} 
                                    alt={menu.name} 
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                                />
                            ) : (
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.8rem' }}>
                                    No Image
                                </div>
                            )}

                            <div>
                                <small style={{ color: '#888', fontWeight: 'bold' }}>[{menu.cafeteria_name || '식당정보 없음'}]</small>
                                <h4 style={{ margin: '5px 0 5px 0', fontSize: '1.1rem' }}>
                                    {menu.name} {menu.is_sold_out && <span style={{ color: 'red', fontSize: '0.8rem' }}>(품절)</span>}
                                </h4>
                                <p style={{ margin: 0, color: '#666' }}>{menu.price.toLocaleString()}원 <span style={{ color: '#aaa' }}>| 리뷰 {menu.review_count}개</span></p>
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
// 2. [Sub Component] 리뷰 관리 (기존 코드 유지)
// --------------------------------------------------------------------------
function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/owner/reviews/', { withCredentials: true });
            setReviews(response.data);
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
            if (error.response && error.response.status === 403) {
                 alert("권한이 없습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDeleteReview = async (id) => {
        if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/owner/reviews/${id}/`, { withCredentials: true });
            alert("리뷰가 삭제되었습니다.");
            fetchReviews();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("삭제 권한이 없습니다.");
            } else {
                alert("리뷰 삭제 실패!");
            }
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
                                {review.cafeteria_name && <span style={{marginRight: '10px', fontWeight:'bold', color: '#555'}}>[{review.cafeteria_name}]</span>}
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