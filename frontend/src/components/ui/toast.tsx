"use client";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import React, { useCallback, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastContext = React.createContext({
  showToast: (
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: "success" | "error" | "info" = "info"
  ) => {},
});

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-100 text-green-800"
                : toast.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            } transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center">
              {toast.type === "error" && (
                <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              )}
              {toast.type === "success" && (
                <CheckCircle size={18} className="mr-2 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
