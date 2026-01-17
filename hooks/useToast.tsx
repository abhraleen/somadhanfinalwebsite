import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  pushToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, message, type };
    setToasts(prev => [...prev, item]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[1000] space-y-3">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-black uppercase tracking-widest animate__animated animate__fadeInUp ${toastPalette(t.type)}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

function toastPalette(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-emerald-600/90 text-white border-emerald-400/40';
    case 'info':
      return 'bg-blue-600/90 text-white border-blue-400/40';
    case 'warning':
      return 'bg-amber-600/90 text-white border-amber-400/40';
    case 'error':
      return 'bg-red-600/90 text-white border-red-400/40';
    default:
      return 'bg-white/80 text-black border-black/10';
  }
}
