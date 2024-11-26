// src/components/Modal.js
import React from 'react';
import '../style/Modal.css'; // 필요한 경우 CSS 스타일 추가

const insertLineBreaks = (text, maxCharsPerLine) => {
  const regex = new RegExp(`(.{1,${maxCharsPerLine}})`, 'g');
  return text.match(regex).join('<br/>');
};
const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null; // 모달이 열려 있지 않으면 아무 것도 렌더링하지 않음

  // 특정 글자 수마다 줄바꿈을 추가한 메시지 생성
  const maxCharsPerLine = 30; // 여기서 글자 수 설정
  const formattedMessage = insertLineBreaks(message, maxCharsPerLine);


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p dangerouslySetInnerHTML={{ __html: formattedMessage }}></p>
        <div className='modal-buttons'>
        <button onClick={onClose} className='Roommodalclose'>취소</button>
        <button onClick={onConfirm} className='Roommodalfirm'>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
