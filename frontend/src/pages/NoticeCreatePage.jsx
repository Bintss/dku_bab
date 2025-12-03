import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NoticeCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 1. 권한 확인 (페이지 진입 시)
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/me/', {
          withCredentials: true,
        });
        const userData = response.data;

        if (!userData.is_authenticated) {
          alert('로그인이 필요합니다.');
          navigate('/login'); // 로그인 페이지로 리다이렉트
          return;
        }

        // is_owner 권한 확인 (관리자 또는 식당 주인)
        if (!userData.is_owner) {
          alert('공지사항 작성 권한이 없습니다.');
          navigate('/notices'); // 공지사항 목록으로 리다이렉트
        }
        setUser(userData);
      } catch (error) {
        console.error('권한 확인 실패:', error);
        alert('오류가 발생했습니다.');
        navigate('/notices');
      }
    };

    checkPermission();
  }, [navigate]);

  // 2. 공지사항 등록 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    // CSRF 토큰 가져오기
    const getCookie = (name) => {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    };
    const csrftoken = getCookie('csrftoken');

    try {
      await axios.post(
        'http://localhost:8000/api/notices/',
        {
          title,
          content,
          is_pinned: isPinned,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('공지사항이 등록되었습니다.');
      navigate('/notices'); // 등록 후 목록으로 이동
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="page-container">권한 확인 중...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">✏️ 공지사항 작성</h2>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 제목 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* 중요 공지 체크박스 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>📌 중요 공지로 상단 고정</span>
          </label>
        </div>

        {/* 내용 입력 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지 내용을 입력하세요"
            rows="15"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* 버튼 영역 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/notices')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}