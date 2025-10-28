import { useMemo } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  duration?: number;
  id?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  closeButton?: boolean;
  actionButtonStyle?: React.CSSProperties;
  actionButtonClassName?: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
}

export function useToast() {
  return useMemo(() => {
    const showToast = (message: string, type: ToastType = "info", options?: ToastOptions) => {
      switch (type) {
        case "success":
          toast.success(message, options);
          break;
        case "error":
          toast.error(message, options);
          break;
        case "warning":
          toast.warning(message, options);
          break;
        default:
          toast.info(message, options);
      }
    };

    return {
      success: (message: string, options?: ToastOptions) => showToast(message, "success", options),
      error: (message: string, options?: ToastOptions) => showToast(message, "error", options),
      warning: (message: string, options?: ToastOptions) => showToast(message, "warning", options),
      info: (message: string, options?: ToastOptions) => showToast(message, "info", options),
      promise: toast.promise,
      dismiss: toast.dismiss,
    };
  }, []);
}
