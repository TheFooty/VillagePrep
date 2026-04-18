'use client';

import { useToast } from '@/contexts/ToastContext';

export function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  const styles = {
    success: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '#10b981',
      color: '#6ee7b7',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '#ef4444',
      color: '#fca5a5',
    },
    info: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '#10b981',
      color: '#6ee7b7',
    },
  };

  const toastStyle = styles[toast.type];

  return (
    <div
      className="toast-animate"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 50,
        padding: '14px 20px',
        background: toastStyle.background,
        border: `1px solid ${toastStyle.border}`,
        borderRadius: '12px',
        color: toastStyle.color,
        fontSize: '14px',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
      onClick={hideToast}
      role="alert"
      aria-live="polite"
    >
      {toast.message}
      <style>{`
        .toast-animate {
          animation: slideInRight 0.3s ease;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (max-width: 640px) {
          .toast-animate {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}