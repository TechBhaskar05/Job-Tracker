import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const icons = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ',
};

const accentBarColors = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
};

const iconColors = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

const Toast = ({ id, message, type, duration, isExiting, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className={`bg-bg-800 border border-border rounded-lg px-4 py-3 flex items-center gap-3 shadow-md relative overflow-hidden ${isExiting ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'animate-[slideIn_0.3s_ease-out]'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${accentBarColors[type]}`}></div>
      <div className={`text-base font-bold size-5 flex items-center justify-center ${iconColors[type]}`}>{icons[type]}</div>
      <p className="text-text-200 text-sm flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="bg-transparent text-text-300 text-xl leading-none p-1 rounded-sm hover:bg-bg-700 hover:text-text-100">&times;</button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const [exitingIds, setExitingIds] = useState(new Set());

  useEffect(() => {
    const handleShowToast = (e) => {
      setToasts((prev) => [...prev, e.detail]);
    };

    document.addEventListener('jt:toast', handleShowToast);
    return () => document.removeEventListener('jt:toast', handleShowToast);
  }, []);

  const handleDismiss = useCallback((id) => {
    setExitingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 min-w-[300px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} isExiting={exitingIds.has(toast.id)} onDismiss={handleDismiss} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
