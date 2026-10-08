import { Skeleton } from "@/components/ui/skeleton";

export default function DatasetLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
