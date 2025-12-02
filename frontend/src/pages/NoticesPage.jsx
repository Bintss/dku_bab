// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function formatDate(dateString) {
//   if (!dateString) return '';
//   const d = new Date(dateString);
//   return d.toLocaleDateString('ko-KR', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//   });
// }

// export default function NoticesPage() {
//   const [notices, setNotices] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get('http://localhost:8000/api/notices/');
//         const data = Array.isArray(res.data)
//           ? res.data
//           : res.data.results || [];
//         setNotices(data);
//       } catch (e) {
//         console.error('전체 공지 불러오기 실패:', e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) return <div className="page-container">공지사항 불러오는 중...</div>;

//   return (
//     <div className="page-container">
//       <h2 className="page-title">공지사항 전체 보기</h2>
//       {notices.length === 0 ? (
//         <div className="notice-empty">등록된 공지사항이 없습니다.</div>
//       ) : (
//         <div className="notice-page-list">
//           {notices.map((notice) => (
//             <div key={notice.id} className="notice-page-item">
//               <div className="notice-page-header">
//                 <div className="notice-page-title">
//                   {notice.is_pinned && <span className="notice-pin">📌</span>}
//                   <span>{notice.title}</span>
//                 </div>
//                 <div className="notice-page-date">
//                   {formatDate(notice.created_at)}
//                 </div>
//               </div>
//               <div className="notice-page-content">{notice.content}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ 전체 공지 목록 불러오기
    (async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/notices/");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setNotices(data);
      } catch (e) {
        console.error("전체 공지 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page-container">공지사항 불러오는 중...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">공지사항 전체 보기</h2>

      {notices.length === 0 ? (
        <div className="notice-empty">등록된 공지사항이 없습니다.</div>
      ) : (
        <div className="notice-page-list">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="notice-page-item"
              // ✅ 아이템 클릭 시 디테일 페이지로 이동
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
                {/* 내용 일부만 미리보기 */}
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
