import { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { TOAST_DISMISS_MS } from '@/utils/constants';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);
  return {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  };
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const styles = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
} as const;

function ToastItemCard({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), TOAST_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg transition-all ${styles[toast.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItemCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
