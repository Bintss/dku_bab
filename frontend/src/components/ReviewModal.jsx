// src/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';

export default function ReviewModal({ isOpen, onClose, onSubmit, menuName }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);       // 선택된 파일 객체
  const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 이미지 URL

  // 모달이 닫힐 때 상태 초기화 (선택 사항)
  useEffect(() => {
    if (!isOpen) {
      setRating(5);
      setContent("");
      setImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // 파일을 읽어서 미리보기 URL 생성
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // 등록 버튼 클릭 핸들러
  const handleSubmit = () => {
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요!");
      return;
    }

    // 부모 컴포넌트(UserPage)의 handleSubmitReview 함수를 호출
    // (별점, 내용, 이미지 파일을 인자로 전달)
    onSubmit(rating, content, image);
    
    onClose(); // 모달 닫기
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '15px',
        width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
      }}>
        
        {/* 헤더 */}
        <h2 style={{marginTop: 0, color: '#333'}}>✍️ 리뷰 쓰기</h2>
        <p style={{color: '#007bff', fontWeight: 'bold', marginBottom: '20px'}}>
            {menuName}
        </p>
        
        {/* 1. 별점 선택 */}
        <div style={{marginBottom: '15px'}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9rem'}}>
            별점
          </label>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
          >
            <option value="5">⭐⭐⭐⭐⭐ (5점 - 최고)</option>
            <option value="4">⭐⭐⭐⭐ (4점 - 좋음)</option>
            <option value="3">⭐⭐⭐ (3점 - 보통)</option>
            <option value="2">⭐⭐ (2점 - 별로)</option>
            <option value="1">⭐ (1점 - 최악)</option>
          </select>
        </div>

        {/* 2. 내용 입력 */}
        <div style={{marginBottom: '15px'}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9rem'}}>
            내용
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="솔직한 후기를 남겨주세요. (맛, 양, 서비스 등)"
            style={{
                width: '100%', height: '80px', padding: '10px', 
                borderRadius: '5px', border: '1px solid #ddd', resize: 'none',
                fontFamily: 'inherit'
            }}
          />
        </div>

        {/* 3. 사진 첨부 영역 */}
        <div style={{marginBottom: '20px'}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9rem'}}>
            사진 첨부 (선택)
          </label>
          <input 
            type="file" 
            accept="image/*" // 이미지 파일만 선택 가능
            onChange={handleImageChange}
            style={{fontSize: '0.9rem', width: '100%'}}
          />
          
          {/* 이미지 미리보기 */}
          {previewUrl && (
            <div style={{marginTop: '10px', textAlign: 'center', backgroundColor: '#f8f9fa', padding: '5px', borderRadius: '8px'}}>
                <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{maxWidth: '100%', maxHeight: '150px', borderRadius: '5px', objectFit: 'contain'}} 
                />
                <p style={{fontSize: '0.8rem', color: '#666', margin: '5px 0 0 0'}}>이미지 미리보기</p>
            </div>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={handleSubmit} 
            style={{
                flex: 1, padding: '12px', backgroundColor: '#007bff', 
                color: 'white', border: 'none', borderRadius: '8px', 
                cursor: 'pointer', fontWeight:'bold', fontSize: '1rem'
            }}
          >
            등록하기
          </button>
          <button 
            onClick={onClose} 
            style={{
                flex: 1, padding: '12px', backgroundColor: '#6c757d', 
                color: 'white', border: 'none', borderRadius: '8px', 
                cursor: 'pointer', fontSize: '1rem'
            }}
          >
            취소
          </button>
        </div>

      </div>
    </div>
  );
}