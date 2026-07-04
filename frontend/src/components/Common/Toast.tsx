import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'warning';
}

interface ToastProps {
  message: string;
  type: 'success' | 'danger' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'danger': return '✕';
      case 'warning': return '⚠';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <span style={{
        fontWeight: 'bold',
        color: type === 'success' ? 'var(--success-color)' : type === 'danger' ? 'var(--danger-color)' : 'var(--warning-color)',
        fontSize: '1.1rem'
      }}>
        {getIcon()}
      </span>
      <div className="toast-message">{message}</div>
      <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '1rem',
        marginLeft: '10px'
      }}>
        &times;
      </button>
    </div>
  );
};
export default Toast;
