import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 rounded-md",
        variant === "rect" && "rounded-xl",
        className
      )}
    />
  );
}