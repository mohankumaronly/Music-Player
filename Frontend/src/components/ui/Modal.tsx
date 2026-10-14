import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  /** Disable closing on backdrop / Esc (e.g., during upload) */
  disableDismiss?: boolean;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  disableDismiss,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableDismiss) onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, disableDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={disableDismiss ? undefined : onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full glass-strong rounded-2xl shadow-2xl",
          "max-h-[90vh] overflow-hidden flex flex-col",
          "animate-fade-in",
          sizes[size]
        )}
      >
        {(title || description) && (
          <header className="flex items-start gap-4 border-b border-[rgb(var(--glass-border))] px-5 py-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-base font-semibold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-[rgb(var(--text-secondary))]">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={disableDismiss}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
        )}

        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}