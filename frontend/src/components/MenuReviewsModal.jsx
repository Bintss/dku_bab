// src/components/MenuReviewsModal.jsx
import React from 'react';

export default function MenuReviewsModal({ isOpen, onClose, menu }) {
  if (!isOpen || !menu) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }} onClick={onClose}> {/* 배경 클릭 시 닫힘 */}
      
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '15px',
        width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}> {/* 내부 클릭 시 안 닫힘 */}
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
            <h2 style={{margin: 0, color: '#333'}}>🗣️ 메뉴 리뷰</h2>
            <button onClick={onClose} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
        </div>

        <div style={{marginBottom: '20px'}}>
            <h3 style={{margin: '0 0 5px 0', color: '#007bff'}}>{menu.name}</h3>
            <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>{menu.price.toLocaleString()}원</p>
        </div>

        {/* 리뷰 목록 리스트 */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {menu.reviews && menu.reviews.length > 0 ? (
                menu.reviews.map((review, idx) => (
                    <div key={idx} style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem'}}>
                            <span style={{fontWeight: 'bold'}}>{review.author || '익명'}</span>
                            <span style={{color: '#aaa'}}>{review.date || '날짜 없음'}</span>
                        </div>
                        <div style={{marginBottom: '8px', color: '#fbc02d'}}>
                            {'⭐'.repeat(review.rating)}
                        </div>
                        <p style={{margin: 0, color: '#444', lineHeight: '1.4', fontSize: '0.95rem'}}>
                            {review.content}
                        </p>
                    </div>
                ))
            ) : (
                <div style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                    <p>아직 작성된 리뷰가 없습니다.</p>
                </div>
            )}
        </div>

        <button 
            onClick={onClose}
            style={{
                width: '100%', marginTop: '20px', padding: '12px', 
                backgroundColor: '#6c757d', color: 'white', border: 'none', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}
        >
            닫기
        </button>
      </div>
    </div>
  );
}