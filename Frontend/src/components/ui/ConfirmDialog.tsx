import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      disableDismiss={isLoading}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={
              variant === "danger"
                ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500"
                : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-500"
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "solid" : "gradient"}
            className={
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : undefined
            }
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}