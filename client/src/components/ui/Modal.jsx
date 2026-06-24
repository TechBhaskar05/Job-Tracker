import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_200ms_ease-out]" onClick={onClose}>
      <div
        className={`bg-bg-800 border border-border rounded-xl shadow-lg w-[90%] animate-[slideUp_250ms_ease-out] max-h-[85vh] flex flex-col ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="bg-transparent text-text-300 text-2xl leading-none p-1 rounded-sm hover:bg-bg-700 hover:text-text-100">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
