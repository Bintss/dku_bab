// 공지사항 전체 목록 페이지
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [user, setUser] = useState(null); // [추가] 로그인한 유저 정보 저장
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 공지사항 목록 불러오기
        const res = await axios.get("http://localhost:8000/api/notices/");
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setNotices(data);

        // 2. [추가] 현재 로그인한 유저 정보(권한) 확인하기
        // withCredentials: true가 있어야 쿠키(세션ID)를 같이 보냅니다.
        const userRes = await axios.get("http://localhost:8000/api/auth/me/", {
            withCredentials: true 
        });
        
        if (userRes.data.is_authenticated) {
            setUser(userRes.data);
        }

      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 버튼 표시 여부 결정: 유저 정보가 있고, is_owner 권한이 true일 때
  const canWriteNotice = user && user.is_owner;

  if (loading) return <div className="page-container">공지사항 불러오는 중...</div>;

  return (
    <div className="page-container">
      
      {/* 헤더 영역: 제목과 버튼 배치 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>📢 공지사항</h2>
        
        {/* [추가] 권한이 있는 사람에게만 보이는 버튼 */}
        {canWriteNotice && (
          <button 
            onClick={() => navigate('/notices/create')} // 작성 페이지 경로 (추후 라우터 설정 필요)
            style={{
                padding: '10px 20px',
                backgroundColor: '#2c3e50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}
          >
            ✏️ 공지 작성
          </button>
        )}
      </div>

      {notices.length === 0 ? (
        <div className="notice-empty">등록된 공지사항이 없습니다.</div>
      ) : (
        <div className="notice-page-list">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="notice-page-item"
              onClick={() => navigate(`/notices/${notice.id}`)}
            >
              <div className="notice-page-header">
                <div className="notice-page-title">
                  {notice.is_pinned && <span className="notice-pin">📌</span>}
                  <span>{notice.title}</span>
                </div>
                <div className="notice-page-date">
                  {formatDate(notice.created_at)}
                </div>
              </div>
              <div className="notice-page-content-preview">
                {notice.content && notice.content.length > 70
                  ? `${notice.content.slice(0, 70)}...`
                  : notice.content}
              </div>
              <div className="notice-page-more">자세히 보기 &gt;</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
