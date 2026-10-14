import { Music2 } from "lucide-react";
import { hashGradient } from "../../lib/format";
import { cn } from "../../lib/cn";

interface PlayerCoverProps {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
}

export function PlayerCover({ src, alt, seed = alt, className }: PlayerCoverProps) {
  const gradient = hashGradient(seed);

  return (
    <div
      className={cn(
        "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-md",
        className
      )}
      style={
        !src
          ? {
              backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }
          : undefined
      }
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-white/80">
          <Music2 className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}