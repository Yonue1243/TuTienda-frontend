'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StorefrontProductCard } from './storefront-product-card';

type Props = {
  title: string;
  products: ProductDto[];
  viewAllHref?: string;
  onAddToCart?: (p: ProductDto) => void;
  className?: string;
};

const navBtnClass =
  'inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)]/95 text-[color:var(--sf-text)] shadow-md backdrop-blur-sm motion-safe:transition-colors hover:bg-[color:var(--sf-product-card-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)] disabled:pointer-events-none disabled:opacity-35 sm:size-10';

export function CategoryProductCarousel({
  title,
  products,
  viewAllHref,
  onAddToCart,
  className,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, products]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  const showNav = products.length > 1 && (canPrev || canNext);

  return (
    <section className={cn('space-y-4', className)} aria-labelledby={`cat-row-${title.replace(/\s+/g, '-')}`}>
      <div className="flex items-end justify-between gap-3">
        <h3
          id={`cat-row-${title.replace(/\s+/g, '-')}`}
          className="text-lg font-semibold tracking-tight text-[color:var(--sf-text)] sm:text-xl"
        >
          {title}
        </h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-medium text-[color:var(--sf-primary)] underline-offset-4 hover:underline"
          >
            Ver todo
          </Link>
        ) : null}
      </div>

      <div className="group/carousel relative">
        {showNav ? (
          <>
            <button
              type="button"
              aria-label={`Anterior en ${title}`}
              onClick={scrollPrev}
              disabled={!canPrev}
              className={cn(
                navBtnClass,
                'absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 motion-safe:transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 max-sm:opacity-100',
              )}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`Siguiente en ${title}`}
              onClick={scrollNext}
              disabled={!canNext}
              className={cn(
                navBtnClass,
                'absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 opacity-0 motion-safe:transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 max-sm:opacity-100',
              )}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3 sm:gap-4">
            {products.map((p) => (
              <div key={p.id} className="min-w-0 shrink-0 grow-0">
                <StorefrontProductCard
                  product={p}
                  variant="carousel"
                  onAdd={onAddToCart ? () => onAddToCart(p) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
