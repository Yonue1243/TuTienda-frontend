import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const sk = 'rounded-xl bg-zinc-800/75 sm:rounded-2xl';

/**
 * Carga de la tienda pública: mismo ritmo visual que el hero + catálogo
 * (banner panorámico, identidad, CTAs, grilla de productos).
 */
export function StorefrontPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* Banner: misma familia de proporción que el carrusel / hero con imagen (21:9 + altura mínima) */}
        <Skeleton
          className={cn(
            'w-full',
            sk,
            'aspect-21/9 min-h-[168px] shadow-sm ring-1 ring-white/6 sm:min-h-[200px] md:min-h-[240px] lg:min-h-[260px]',
          )}
          aria-hidden
        />

        {/* Bloque tipo hero: logo + título + descripción + dos CTAs en pastilla */}
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
          className="my-10 h-px w-full bg-linear-to-r from-transparent via-zinc-700/80 to-transparent sm:my-12"
          aria-hidden
        />

        {/* Una fila de cuatro cards de producto (ratio 4:5 como el catálogo real) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('aspect-4/5 w-full shadow-sm ring-1 ring-white/5', sk)}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
