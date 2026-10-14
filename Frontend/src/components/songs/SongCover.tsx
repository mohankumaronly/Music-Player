import { Music2 } from "lucide-react";
import { hashGradient } from "../../lib/format";
import { API_BASE_URL } from "../../lib/constants";
import { cn } from "../../lib/cn";

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface SongCoverProps {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SongCover({
  src,
  alt,
  seed = alt,
  className,
  size = "md",
}: SongCoverProps) {
  const resolved = resolveUrl(src);
  const gradient = hashGradient(seed);

  return (
    <div
      className={cn(
        "relative overflow-hidden shrink-0",
        size === "sm" && "h-10 w-10 rounded-md",
        size === "md" && "h-14 w-14 rounded-lg",
        size === "lg" && "aspect-square w-full rounded-xl",
        className
      )}
      style={
        !resolved
          ? { backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }
          : undefined
      }
    >
      {resolved ? (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            (e.currentTarget.parentElement as HTMLElement).style.backgroundImage =
              `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`;
          }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-white/80">
          <Music2
            className={cn(
              size === "sm" && "h-4 w-4",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-10 w-10"
            )}
          />
        </div>
      )}
    </div>
  );
}