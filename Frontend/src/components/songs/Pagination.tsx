import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  // Build page window: first, ..., current-1, current, current+1, ..., last
  const pages: (number | "…")[] = [];
  const add = (n: number | "…") => {
    if (pages[pages.length - 1] !== n) pages.push(n);
  };
  const windowSize = 1;
  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= page - windowSize && i <= page + windowSize)
    ) {
      add(i);
    } else {
      add("…");
    }
  }

  return (
    <div className={cn("flex items-center justify-center gap-1 mt-8", className)}>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className="h-8 w-8 p-0"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="px-2 text-sm text-[rgb(var(--text-tertiary))]"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "h-8 min-w-8 rounded-md px-2 text-sm transition-colors",
              p === page
                ? "bg-brand-600 text-white"
                : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text-primary))]"
            )}
            aria-current={p === page ? "page" : undefined}
          >
            {p + 1}
          </button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className="h-8 w-8 p-0"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}