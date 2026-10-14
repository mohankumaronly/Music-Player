import { useRef, useState } from "react";
import { UploadCloud, X, FileAudio, Image as ImageIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatBytes } from "../../lib/format";

interface FileDropzoneProps {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
  /** Preview rendering: for images show thumbnail */
  previewType?: "image" | "audio";
  disabled?: boolean;
}

export function FileDropzone({
  label,
  accept,
  file,
  onChange,
  hint,
  previewType,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewUrl =
    file && previewType === "image" ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">
        {label}
      </span>

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center gap-3 rounded-xl p-3 transition-all",
          "surface cursor-pointer hover:border-brand-500/40",
          dragOver &&
            "border-brand-500 border-2 border-dashed bg-brand-500/5 ring-4 ring-brand-500/10",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Preview / icon */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-12 w-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[rgb(var(--bg-muted))]">
            {previewType === "image" ? (
              <ImageIcon className="h-5 w-5 text-[rgb(var(--text-tertiary))]" />
            ) : previewType === "audio" ? (
              <FileAudio className="h-5 w-5 text-[rgb(var(--text-tertiary))]" />
            ) : (
              <UploadCloud className="h-5 w-5 text-[rgb(var(--text-tertiary))]" />
            )}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          {file ? (
            <>
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-xs text-[rgb(var(--text-tertiary))]">
                {formatBytes(file.size)}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm">
                <span className="text-brand-500 font-medium">Click to browse</span>
                <span className="text-[rgb(var(--text-tertiary))]">
                  {" "}
                  or drag & drop
                </span>
              </div>
              {hint && (
                <div className="text-xs text-[rgb(var(--text-tertiary))]">
                  {hint}
                </div>
              )}
            </>
          )}
        </div>

        {/* Clear */}
        {file && (
          <button
            type="button"
            onClick={clear}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[rgb(var(--text-tertiary))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
      </div>
    </div>
  );
}