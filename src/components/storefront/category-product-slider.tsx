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
  'inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-surface)] text-[color:var(--sf-text)] shadow-[var(--sf-shadow-sm)] backdrop-blur-sm motion-safe:transition-[box-shadow,background-color] hover:bg-[color:var(--sf-bg-accent)] hover:shadow-[var(--sf-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)] disabled:pointer-events-none disabled:opacity-35 sm:size-10';

const slideClass =
  'min-w-0 shrink-0 grow-0 basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)]';

export function CategoryProductSlider({
  title,
  products,
  viewAllHref,
  onAddToCart,
  className,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 'auto',
    duration: 28,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelectedSnap(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
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
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (products.length === 0) return null;

  const showNav = products.length > 1 && (canPrev || canNext);
  const showDots = snapCount > 1;

  return (
    <section className={cn('space-y-4', className)} aria-labelledby={`cat-row-${title.replace(/\s+/g, '-')}`}>
      <div className="flex items-end justify-between gap-3">
        <h3
          id={`cat-row-${title.replace(/\s+/g, '-')}`}
          className="text-lg font-semibold tracking-tight text-[color:var(--sf-text)] sm:text-xl"
        >
          {title}
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          {showNav ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                aria-label={`Página anterior en ${title}`}
                onClick={scrollPrev}
                disabled={!canPrev}
                className={navBtnClass}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Página siguiente en ${title}`}
                onClick={scrollNext}
                disabled={!canNext}
                className={navBtnClass}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="shrink-0 text-sm font-medium text-[color:var(--sf-primary)] underline-offset-4 hover:underline"
            >
              Ver todo
            </Link>
          ) : null}
        </div>
      </div>

      <div className="group/slider relative -mx-1 px-1">
        {showNav ? (
          <>
            <button
              type="button"
              aria-label={`Anterior en ${title}`}
              onClick={scrollPrev}
              disabled={!canPrev}
              className={cn(
                navBtnClass,
                'absolute left-0 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2 sm:hidden',
                !canPrev && 'opacity-40',
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
                'absolute right-0 top-[38%] z-10 translate-x-1/2 -translate-y-1/2 sm:hidden',
                !canNext && 'opacity-40',
              )}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}

        <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
          <div className="flex gap-3 sm:gap-4">
            {products.map((p) => (
              <div key={p.id} className={slideClass}>
                <StorefrontProductCard
                  product={p}
                  variant="slider"
                  onAdd={onAddToCart ? () => onAddToCart(p) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDots ? (
        <div className="flex justify-center gap-2 pt-1" role="tablist" aria-label={`Páginas de ${title}`}>
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selectedSnap}
              aria-label={`Ir a la página ${i + 1} de ${title}`}
              onClick={() => scrollTo(i)}
              className={cn(
                'h-1.5 rounded-full motion-safe:transition-all motion-safe:duration-300',
                i === selectedSnap
                  ? 'w-6 bg-[color:var(--sf-primary)]'
                  : 'w-1.5 bg-[color:var(--sf-card-border)] hover:bg-[color:var(--sf-muted)]/50',
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
