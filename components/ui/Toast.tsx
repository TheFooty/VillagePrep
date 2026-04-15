'use client';

import { useToast } from '@/contexts/ToastContext';

export function Toast() {
  const { toast, hideToast } = useToast();
  
  if (!toast) return null;
  
  const bg = {
    success: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
    error: 'bg-red-500/20 border-red-500 text-red-300',
    info: 'bg-[#14b8a6]/20 border-[#14b8a6] text-[#14b8a6]',
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border backdrop-blur-sm animate-slide-in cursor-pointer ${bg[toast.type]}`} onClick={hideToast}>
      {toast.message}
    </div>
  );
}