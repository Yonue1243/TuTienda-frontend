import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const sk = 'rounded-xl bg-stone-200/80 sm:rounded-2xl';

/**
 * Carga de la tienda pública: mismo ritmo visual que el hero + catálogo (tema cálido).
 */
export function StorefrontPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 antialiased [background-image:radial-gradient(ellipse_120%_80%_at_50%_-20%,#f3efe8,transparent_55%),linear-gradient(180deg,#faf8f5_0%,#f5f1eb_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <Skeleton
          className={cn(
            'w-full',
            sk,
            'aspect-21/9 min-h-[168px] shadow-sm ring-1 ring-stone-900/5 sm:min-h-[200px] md:min-h-[240px] lg:min-h-[260px]',
          )}
          aria-hidden
        />

        <div className="mt-8 flex flex-col gap-8 sm:mt-10 sm:flex-row sm:items-start md:mt-12 md:gap-10">
          <Skeleton className={cn('size-16 shrink-0 sm:size-20 md:h-20 md:w-20', sk)} aria-hidden />
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className={cn('h-9 w-[min(100%,20rem)] sm:h-10 md:h-11', sk)} aria-hidden />
            <div className="space-y-2.5">
              <Skeleton className={cn('h-3.5 w-full max-w-xl', sk)} aria-hidden />
              <Skeleton className={cn('h-3.5 w-full max-w-lg', sk)} aria-hidden />
              <Skeleton className={cn('hidden h-3.5 max-w-md sm:block', sk)} aria-hidden />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Skeleton className={cn('h-10 w-30 rounded-full', sk)} aria-hidden />
              <Skeleton className={cn('h-10 w-26 rounded-full', sk)} aria-hidden />
            </div>
          </div>
        </div>

        <div
          className="my-10 h-px w-full bg-linear-to-r from-transparent via-stone-300/80 to-transparent sm:my-12"
          aria-hidden
        />

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-[220px] w-[9.25rem] shrink-0 sm:w-[11.25rem]', sk)}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
