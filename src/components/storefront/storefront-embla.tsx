'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CarouselSlideDto } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  slides: CarouselSlideDto[];
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

export function StorefrontEmblaCarousel({ slides, className }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const plugins = reducedMotion ? [] : [Autoplay({ delay: 5500, stopOnInteraction: true })];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 }, plugins);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, slides]);

  if (slides.length === 0) return null;

  const navBtnClass =
    'inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)]/95 text-[color:var(--sf-text)] shadow-md backdrop-blur-sm motion-safe:transition-colors hover:bg-[color:var(--sf-product-card-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)] disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className={cn('relative', className)}>
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 shrink-0 grow-0 basis-full"
              style={{ flex: '0 0 100%' }}
            >
              <div className="relative aspect-[21/9] min-h-[200px] w-full bg-black/25 sm:min-h-[240px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15 motion-safe:transition-opacity"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-white sm:p-8 md:p-10 md:pb-12">
                  {slide.title ? (
                    <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                  ) : null}
                  {slide.subtitle ? (
                    <p className="max-w-2xl text-pretty text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  {slide.ctaLabel && slide.ctaHref ? (
                    <a
                      href={slide.ctaHref}
                      className="mt-1 inline-flex w-fit rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg motion-safe:transition hover:opacity-95"
                      style={{
                        backgroundColor: 'var(--sf-btn)',
                        color: 'var(--sf-btn-text)',
                      }}
                    >
                      {slide.ctaLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-end gap-2 px-4 sm:bottom-5 sm:px-6">
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={scrollPrev}
            className={cn(navBtnClass, 'pointer-events-auto')}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Slide siguiente"
            onClick={scrollNext}
            className={cn(navBtnClass, 'pointer-events-auto')}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
