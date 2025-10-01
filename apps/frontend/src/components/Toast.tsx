import { create } from 'zustand';
import { useEffect } from 'react';

interface ToastState {
  message?: string;
  show: (message: string) => void;
  clear: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: undefined,
  show: (message) => set({ message }),
  clear: () => set({ message: undefined })
}));

export const useToast = () => useToastStore((state) => ({ show: state.show }));

export const ToastContainer = () => {
  const { message, clear } = useToastStore((state) => ({ message: state.message, clear: state.clear }));
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(clear, 3500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [message, clear]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-xs -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  );
};
