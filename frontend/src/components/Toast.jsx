// ============================================================
// frontend/src/components/Toast.jsx
// Sistema de notificaciones Toast global
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let toastId = 0;

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
  ),
  error: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  info: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  ),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);
    setTimeout(() => removeToast(id), 4000);
    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    warning: (title, message) => addToast('warning', title, message),
    info: (title, message) => addToast('info', title, message),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type} ${t.exiting ? 'toast--exiting' : ''}`}>
            <div className="toast__icon">{ICONS[t.type]}</div>
            <div className="toast__content">
              <div className="toast__title">{t.title}</div>
              {t.message && <div className="toast__message">{t.message}</div>}
            </div>
            <button className="toast__close" onClick={() => removeToast(t.id)}>✕</button>
            <div className="toast__progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
}
