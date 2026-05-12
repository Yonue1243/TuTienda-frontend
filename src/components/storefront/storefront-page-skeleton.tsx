import { Skeleton } from '@/components/ui/skeleton';

export function StorefrontPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10 md:space-y-14">
        <div className="space-y-6 border-b border-zinc-800/80 pb-10">
          <Skeleton className="h-[min(280px,42vw)] w-full rounded-2xl bg-zinc-800/70" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-16 shrink-0 rounded-2xl bg-zinc-800/70 sm:size-20" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-4/5 max-w-md bg-zinc-800/70" />
              <Skeleton className="h-4 w-full max-w-xl bg-zinc-800/60" />
              <Skeleton className="h-4 w-full max-w-lg bg-zinc-800/60" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 w-36 rounded-full bg-zinc-800/70" />
                <Skeleton className="h-10 w-28 rounded-full bg-zinc-800/60" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl bg-zinc-800/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
