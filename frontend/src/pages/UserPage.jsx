// src/pages/UserPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MenuReviewsModal from '../components/MenuReviewsModal';
import ReviewModal from '../components/ReviewModal';

// 💡 Mock Data (최종 구조)
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


// 👇 [추가] 정렬 방식에 따라 카드 내용을 조건부 렌더링하는 헬퍼 함수
const renderCardContent = (res, currentSortBy, handleOpenWriteModal) => {
    const isDefaultSort = currentSortBy === 'default';
    const mainMenu = res.menus && res.menus.length > 0 ? res.menus[0] : null; 

    const ratingAndReviewDisplay = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fbc02d', fontWeight: 'bold' }}>⭐ {res.avg_rating}</span>
            <span style={{ color: '#007bff', fontSize: '0.9rem', fontWeight: 'bold' }}>📝 리뷰 {res.review_count}</span>
        </div>
    );

    if (isDefaultSort) {
        return (
            <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{res.식당이름}</h3>
                    {ratingAndReviewDisplay}
                </div>
                <p style={{color: '#888', fontSize: '0.9rem', margin: '0 0 15px 0'}}>⏰ {res.operating_hours}</p>
                <div style={{borderTop: '1px dashed #eee', paddingTop: '10px'}}>
                    {res.menus.map(menu => (
                        <div key={menu.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'5px'}}>
                            <span style={{fontWeight:'bold'}}>대표: {menu.name}</span>
                            
                        </div>
                    ))}
                </div>
            </>
        );
    } else {
        return (
            <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem', color: '#007bff'}}>{mainMenu ? mainMenu.name : "메뉴 없음"}</h3>
                    {ratingAndReviewDisplay}
                </div>
                <p style={{color: '#555', fontSize: '0.9rem', margin: '0 0 15px 0'}}>
                    🏛️ {res.식당이름} {mainMenu && <span> | {mainMenu.price}원</span>}
                </p>
                <div style={{borderTop: '1px dashed #eee', paddingTop: '10px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <strong>운영:</strong> <span style={{marginLeft: '5px'}}>{res.operating_hours}</span>
                        {mainMenu && (
                            <button 
                                onClick={(e) => handleOpenWriteModal(e, mainMenu)}
                                style={{
                                    padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#d32f2f', 
                                    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                📝 리뷰 작성
                            </button>
                        )}
                    </div>
                </div>
                <div style={{textAlign:'center', marginTop:'10px', fontSize:'0.8rem', color:'#aaa'}}>
                    👆 카드 눌러서 메뉴 리뷰 보기
                </div>
            </>
        );
    }
}


export default function UserPage() {
  const navigate = useNavigate();
  
  // 🚨 [수정] API 호출 준비를 위해 빈 배열로 초기화합니다.
  const [cafeterias, setCafeterias] = useState([]); 
  const [displayList, setDisplayList] = useState([]); 
  const [loading, setLoading] = useState(true); 
  
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // 모달 상태 관리
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedMenuForWrite, setSelectedMenuForWrite] = useState(null);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [selectedMenuForRead, setSelectedMenuForRead] = useState(null);

  // --------------------------------------------------------------------------
  // 🚩 [통합 지점 2: API 호출 영역]
  // --------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
        // ============================================================
        // ✅ [REAL API Code] 백엔드 연동 시 이 블록을 활성화합니다.
        // ============================================================
        /*
        try {
            const response = await axios.get('http://localhost:8000/api/cafeteria/');
            const data = response.data.cafeterias || [];
            setCafeterias(data);
            setDisplayList(data);
        } catch (error) {
            console.error("API 호출 실패 (Mock Data 사용):", error);
            // API 실패 시 Mock Data로 Fallback (개발 테스트용)
            setCafeterias(MOCK_CAFETERIAS);
            setDisplayList(MOCK_CAFETERIAS);
        } finally {
            setLoading(false);
        }
        */

        // 🚧 [Mock Data Logic] 현재 프론트엔드 테스트용 (활성)
        // ============================================================
        setTimeout(() => {
            setCafeterias(MOCK_CAFETERIAS);
            setDisplayList(MOCK_CAFETERIAS);
            setLoading(false);
        }, 500); 
    };

    fetchData();
  }, []);

  // --- 기능 구현 (Frontend Logic) ---

  // 1. 검색
  const handleSearch = () => {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (!lowerKeyword) { setDisplayList(cafeterias); return; }
    const filtered = cafeterias.filter(res => {
      const nameMatch = res.식당이름.toLowerCase().includes(lowerKeyword);
      const menuMatch = res.menus && res.menus.some(menu => menu.name.toLowerCase().includes(lowerKeyword));
      return nameMatch || menuMatch;
    });
    setDisplayList(filtered);
  };

  // 2. 정렬
  const handleSort = (type) => {
    setSortBy(type);
    setKeyword(""); 
    let sorted = [...cafeterias];

    if (type === 'default') sorted.sort((a, b) => a.id - b.id);
    else if (type === 'rating') sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    else if (type === 'review') sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    
    setDisplayList(sorted);
  };

  // 3. 리뷰 작성 모달 열기
  const handleOpenWriteModal = (e, menu) => {
    e.stopPropagation(); 
    setSelectedMenuForWrite(menu);
    setIsWriteModalOpen(true);
  };

  const handleCloseWriteModal = () => {
    setIsWriteModalOpen(false);
    setSelectedMenuForWrite(null);
  };

  // 4. 리뷰 제출 처리 (Mock)
  const handleSubmitReview = (rating, content, imageFile) => {
    
    // 🚩 [백엔드 통합 지점 3: 리뷰 전송 API 호출] (주석 처리)
    /*
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('content', content);
    formData.append('menu_id', selectedMenuForWrite.id);
    if (imageFile) { formData.append('image', imageFile); }

    try {
      await axios.post(`http://localhost:8000/api/menu/${selectedMenuForWrite.id}/review/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      // ... (성공 후 로직)
    } catch (error) {
      alert("로그인이 필요하거나 오류가 발생했습니다.");
    }
    */

    // 🚧 [Mock Data 테스트]
    alert(`[TEST] 리뷰 등록 완료!\n메뉴: ${selectedMenuForWrite.name}\n별점: ${rating}\n(사진: ${imageFile ? imageFile.name : "없음"})`);
    
    // 화면상 리뷰 수 증가 반영
    const updatedList = cafeterias.map(res => {
        if (res.id === selectedMenuForWrite.restaurantId) {
            return { ...res, review_count: (res.review_count || 0) + 1 };
        }
        return res;
    });
    setCafeterias(updatedList);
    setDisplayList(updatedList);
    
    setIsWriteModalOpen(false);
  };


  // 5. 카드 클릭 핸들러 (내비게이션 분기)
  const handleCardClick = (res) => {
    if (sortBy === 'default') {
        navigate(`/restaurant/${res.id}`); // 상세 페이지 이동
    } else {
        const mainMenu = res.menus && res.menus.length > 0 ? res.menus[0] : null;
        if (mainMenu) {
            setSelectedMenuForRead(mainMenu);
            setIsReadModalOpen(true); // 리뷰 보기 모달
        } else {
            alert("메뉴 정보가 없습니다.");
        }
    }
  };


  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>로딩 중... ⏳</div>;

  return (
    <div>
      {/* 배너 */}
      <div className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">DKU BAB</h1>
          <div className="search-box">
            <input type="text" className="search-input" placeholder="식당 이름이나 메뉴 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <button className="search-btn" onClick={handleSearch}>검색</button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="filter-bar">
        <div className="filter-container">
          <button className={`filter-btn ${sortBy === 'default' ? 'active' : ''}`} onClick={() => handleSort('default')}>🏛️ 전체 식당</button>
          <button className={`filter-btn ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => handleSort('rating')}>⭐ 별점순</button>
          <button className={`filter-btn ${sortBy === 'review' ? 'active' : ''}`} onClick={() => handleSort('review')}>📝 리뷰 많은 순</button>
        </div>
      </div>

      {/* 리스트 */}
      <div className={sortBy === 'default' ? "restaurant-list" : "restaurant-grid"}>
        {displayList.map((res) => (
          <div key={res.id} className="res-card" onClick={() => handleCardClick(res)} style={{ cursor: 'pointer' }}>
            <div className className="res-img-placeholder">🍱</div>
            <div className="res-info">
              {renderCardContent(res, sortBy, handleOpenWriteModal)} 
            </div>
          </div>
        ))}
      </div>

      {/* 모달 영역 */}
      <MenuReviewsModal 
        isOpen={isReadModalOpen}
        onClose={() => setIsReadModalOpen(false)}
        menu={selectedMenuForRead}
      />
      <ReviewModal 
        isOpen={isWriteModalOpen}
        onClose={handleCloseWriteModal}
        onSubmit={handleSubmitReview}
        menuName={selectedMenuForWrite ? selectedMenuForWrite.name : ''}
      />
    </div>
  );
}