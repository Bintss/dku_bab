// src/components/NoticeSection.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function NoticeSection() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/notices/');
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        // 항상 여기서만 3개 잘라서 사용 (3개 넘어가도 문제 없음)
        setNotices(data.slice(0, 3));
      } catch (e) {
        console.error('공지사항 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  return (
    <div className="notice-section">
      <div className="notice-header">
        <span className="notice-title">공지사항</span>
        <span className="notice-badge">DKU BAB</span>
      </div>

      <div className="notice-list-wrapper">
        <div className="notice-list">
          {notices.length === 0 ? (
            <div className="notice-empty">현재 등록된 공지사항이 없습니다.</div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`notice-item ${activeId === notice.id ? 'active' : ''}`}
                onClick={() =>
                  setActiveId((prev) => (prev === notice.id ? null : notice.id))
                }
              >
                <div className="notice-item-main">
                  {notice.is_pinned && <span className="notice-pin">📌</span>}
                  <span className="notice-item-title">{notice.title}</span>
                </div>
                <div className="notice-item-meta">
                  <span className="notice-item-date">
                    {formatDate(notice.created_at)}
                  </span>
                </div>
                {activeId === notice.id && (
                  <div className="notice-item-content">{notice.content}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 전체 공지 페이지로 이동하는 버튼 */}
        <button
          type="button"
          className="notice-more-btn"
          onClick={() => navigate('/notices')}
        >
          전체 공지 보기 &gt;
        </button>
      </div>
    </div>
  );
}
