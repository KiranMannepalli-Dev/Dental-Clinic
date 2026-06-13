"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<
  ToastType,
  { border: string; icon: string; bg: string; progress: string }
> = {
  success: {
    bg: "bg-white",
    border: "border-l-4 border-l-emerald-500 border border-slate-100",
    icon: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  error: {
    bg: "bg-white",
    border: "border-l-4 border-l-red-500 border border-slate-100",
    icon: "text-red-500",
    progress: "bg-red-500",
  },
  info: {
    bg: "bg-white",
    border: "border-l-4 border-l-blue-500 border border-slate-100",
    icon: "text-blue-500",
    progress: "bg-blue-500",
  },
  warning: {
    bg: "bg-white",
    border: "border-l-4 border-l-amber-500 border border-slate-100",
    icon: "text-amber-500",
    progress: "bg-amber-500",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 5000;
  const style = STYLES[toast.type];
  const Icon = ICONS[toast.type];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const step = 100 / (duration / 100);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return p - step;
      });
    }, 100);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onRemove, toast.id]);

  return (
    <div
      className={`relative w-80 max-w-[calc(100vw-2rem)] rounded-lg shadow-lg overflow-hidden
        ${style.bg} ${style.border}
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
        <div
          className={`h-full ${style.progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => {
      const next = [...prev, { ...toast, id }];
      // Keep max 4 toasts
      return next.slice(-4);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "success", title, message }),
    [addToast]
  );
  const error = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "error", title, message }),
    [addToast]
  );
  const info = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "info", title, message }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "warning", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
