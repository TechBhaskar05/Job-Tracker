import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

const icons = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ',
};

const Toast = ({ id, message, type, duration, isExiting, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[type]} ${isExiting ? styles.exiting : ''}`}>
      <div className={styles.accentBar}></div>
      <div className={styles.icon}>{icons[type]}</div>
      <p className={styles.message}>{message}</p>
      <button onClick={() => onDismiss(id)} className={styles.closeButton}>&times;</button>
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
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} isExiting={exitingIds.has(toast.id)} onDismiss={handleDismiss} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
