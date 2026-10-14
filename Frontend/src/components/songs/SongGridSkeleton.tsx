import { Skeleton } from "../ui/Skeleton";

export function SongGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl p-3 surface">
          <Skeleton className="aspect-square w-full" />
          <Skeleton variant="text" className="mt-3 w-3/4" />
          <Skeleton variant="text" className="mt-1.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}