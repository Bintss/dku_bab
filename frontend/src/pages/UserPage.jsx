// src/pages/UserPage.jsx (전체 덮어쓰기)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 💡 [백엔드 통합 지점 1: Mock Data] 백엔드 구현 후 이 배열은 삭제되어야 합니다.
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
const renderCardContent = (res, currentSortBy) => {
    const isDefaultSort = currentSortBy === 'default';
    const mainMenu = res.menus && res.menus.length > 0 ? res.menus[0] : null;

    // 별점 및 리뷰 개수를 함께 표시하는 공통 요소
    const ratingAndReviewDisplay = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fbc02d', fontWeight: 'bold' }}>
                ⭐ {res.avg_rating ? res.avg_rating.toFixed(1) : '평가없음'}
            </span>
            <span style={{ color: '#007bff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                📝 리뷰 {res.review_count !== undefined ? res.review_count.toLocaleString() : 0}개
            </span>
        </div>
    );

    if (isDefaultSort) {
        // 1. 전체 식당 (식당 정보 중심)
        return (
            <>
                {/* 식당 이름 및 별점/리뷰 정보 */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{res.식당이름}</h3>
                    {ratingAndReviewDisplay}
                </div>
                
                {/* 운영 시간 (식당의 핵심 정보) */}
                <p style={{color: '#888', fontSize: '0.9rem', margin: '0 0 15px 0'}}>
                    ⏰ {res.operating_hours || "시간 미정"}
                </p>
                
                <div style={{borderTop: '1px dashed #eee', paddingTop: '10px'}}>
                    {/* 대표 메뉴 (보조 정보) */}
                    <strong>대표 메뉴:</strong> 
                    {mainMenu ? ` ${mainMenu.name}` : " 메뉴 준비중"}
                </div>
            </>
        );
    } else {
        // 2. 별점순/리뷰순 (음식 메뉴 중심)
        return (
            <>
                {/* 메뉴 이름 (크게 강조) 및 별점 */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem', color: '#007bff'}}>{mainMenu ? mainMenu.name : "메뉴 없음"}</h3>
                    {ratingAndReviewDisplay}
                </div>

                {/* 식당 이름 (보조 정보) */}
                <p style={{color: '#555', fontSize: '0.9rem', margin: '0 0 15px 0'}}>
                    🏛️ {res.식당이름} 
                    {mainMenu && <span> | {mainMenu.price}원</span>}
                </p>
                
                <div style={{borderTop: '1px dashed #eee', paddingTop: '10px'}}>
                    {/* 운영 시간 (보조 정보) */}
                    <strong>운영:</strong> 
                    <span style={{marginLeft: '5px'}}>{res.operating_hours || "시간 미정"}</span>
                </div>
            </>
        );
    }
}


export default function UserPage() {
  const navigate = useNavigate();
  // 🚨 [프론트엔드 코드] API 호출 전까지는 빈 배열로 시작합니다.
  const [cafeterias, setCafeterias] = useState([]); 
  const [displayList, setDisplayList] = useState([]); 
  const [loading, setLoading] = useState(true); // 로딩 상태 추가 (API 호출 시 필요)
  
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // 🚨 [통합 지점 2: API 호출 영역]
  useEffect(() => {
    // ⚠️ 백엔드 개발자가 API 구현을 완료할 때까지는 Mock Data를 사용해 UI 테스트를 합니다.
    axios.get('http://localhost:8000/api/cafeteria/') // 실제 API 주소
      .then(res => {
        const fetchedData = res.data.cafeterias || [];
        setCafeterias(fetchedData);
        setDisplayList(fetchedData);
      })
      .catch(err => {
        // ❌ API 호출 실패 시 Mock Data를 로드하여 UI가 깨지지 않게 합니다.
        console.error("API 연결 실패. Mock 데이터를 사용합니다.", err.response || err);
        setCafeterias(MOCK_CAFETERIAS);
        setDisplayList(MOCK_CAFETERIAS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // 검색 기능 (로직 유지)
  const handleSearch = () => {
    const lowerKeyword = keyword.toLowerCase().trim();

    if (!lowerKeyword) {
      setDisplayList(cafeterias);
      return;
    }

    const filtered = cafeterias.filter(res => {
      const nameMatch = res.식당이름.toLowerCase().includes(lowerKeyword);
      const menuMatch = res.menus && res.menus.some(menu => 
        menu.name.toLowerCase().includes(lowerKeyword)
      );
      return nameMatch || menuMatch;
    });
    
    setDisplayList(filtered);
  };

  // 정렬 기능 (로직 유지)
  const handleSort = (type) => {
    setSortBy(type);
    setKeyword(""); 
    let sorted = [...cafeterias];

    if (type === 'default') {
      sorted.sort((a, b) => a.id - b.id);
    } 
    else if (type === 'rating') {
      sorted.sort((a, b) => {
        const ratingA = a.avg_rating || 0;
        const ratingB = b.avg_rating || 0;
        return ratingB - ratingA;
      });
    } 
    else if (type === 'review') {
      sorted.sort((a, b) => {
        const countA = a.review_count || 0;
        const countB = b.review_count || 0;
        return countB - countA;
      });
    }
    
    setDisplayList(sorted);
  };
  
  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>데이터 로딩 중...</div>;

  return (
    <div>
      {/* ... (Hero Banner와 Filter Bar UI는 그대로 유지) ... */}
      <div className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">DKU BAB</h1>
          <div className="search-box">
            <input 
              type="text" className="search-input"
              placeholder="식당 이름이나 메뉴를 검색해보세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>검색</button>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-container">
          <button 
            className={`filter-btn ${sortBy === 'default' ? 'active' : ''}`} 
            onClick={() => handleSort('default')}
          >
            🏛️ 전체 식당
          </button>
          <button 
            className={`filter-btn ${sortBy === 'rating' ? 'active' : ''}`} 
            onClick={() => handleSort('rating')}
          >
            ⭐ 별점순
          </button>
          <button 
            className={`filter-btn ${sortBy === 'review' ? 'active' : ''}`} 
            onClick={() => handleSort('review')}
          >
            📝 리뷰 많은 순
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className={sortBy === 'default' ? "restaurant-list" : "restaurant-grid"}>
        {displayList.length > 0 ? (
          displayList.map((res) => (
            <div 
                key={res.id} 
                className="res-card" 
                onClick={() => navigate(`/restaurant/${res.id}`)} // 상세 페이지 이동
            >
              <div className="res-img-placeholder">🍱</div>
              <div className="res-info">
                {/* 조건부 렌더링 함수 호출 */}
                {renderCardContent(res, sortBy)} 
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign:'center', width:'100%', padding:'50px', gridColumn: '1 / -1'}}>
            <h3 style={{color: '#555'}}>검색 결과가 없습니다. 😳</h3>
            <p>백엔드 API가 연결되면 정상 작동합니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}