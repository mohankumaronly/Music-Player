import { Skeleton } from "../ui/Skeleton";

export function SongListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton variant="circle" className="h-8 w-8" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-2/5" />
            <Skeleton variant="text" className="mt-1.5 w-1/4" />
          </div>
          <Skeleton variant="text" className="hidden sm:block w-10" />
        </div>
      ))}
    </div>
  );
}