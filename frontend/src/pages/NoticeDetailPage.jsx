// 개별 공지 디테일 페이지
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function NoticeDetailPage() {
  const { id } = useParams();            // URL에서 공지 id 가져오기
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ 개별 공지 데이터 불러오기
    (async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/notices/${id}/`);
        setNotice(res.data);
      } catch (e) {
        console.error("공지 디테일 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="page-container">공지사항 불러오는 중...</div>;
  if (!notice) return <div className="page-container">존재하지 않는 공지입니다.</div>;

  return (
    <div className="page-container notice-detail-container">
      {/* 뒤로가기 버튼 */}
      <button
        type="button"
        className="notice-back-btn"
        onClick={() => navigate(-1)}
      >
        &lt; 뒤로
      </button>

      {/* 제목 영역 */}
      <div className="notice-detail-header">
        <h2 className="notice-detail-title">
          {notice.is_pinned && <span className="notice-pin">📌</span>}
          {notice.title}
        </h2>
        <div className="notice-detail-meta">
          <span className="notice-detail-date">
            {formatDate(notice.created_at)}
          </span>
          {/* 작성자 필드가 있으면 표시 (백엔드 구조에 따라 수정 가능) */}
          {notice.author_name && (
            <span className="notice-detail-author">
              {" "}
              · 작성자: {notice.author_name}
            </span>
          )}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="notice-detail-content">
        {notice.content || "내용이 없습니다."}
      </div>
    </div>
  );
}
