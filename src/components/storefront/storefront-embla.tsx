'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { CarouselSlideDto } from '@/lib/types';

type Props = {
  slides: CarouselSlideDto[];
  className?: string;
};

export function StorefrontEmblaCarousel({ slides, className }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 }, [
    Autoplay({ delay: 5500, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, slides]);

  if (slides.length === 0) return null;

  return (
    <div className={className}>
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 shrink-0 grow-0 basis-full"
              style={{ flex: '0 0 100%' }}
            >
              <div className="relative aspect-[21/9] min-h-[180px] w-full bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white md:p-10">
                  {slide.title ? (
                    <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
                      {slide.title}
                    </h2>
                  ) : null}
                  {slide.subtitle ? (
                    <p className="max-w-xl text-sm text-white/90 md:text-base">{slide.subtitle}</p>
                  ) : null}
                  {slide.ctaLabel && slide.ctaHref ? (
                    <a
                      href={slide.ctaHref}
                      className="mt-2 inline-flex w-fit rounded-full px-5 py-2 text-sm font-semibold shadow-lg transition hover:opacity-95"
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
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            className="rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--sf-text)] hover:bg-white/5"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--sf-text)] hover:bg-white/5"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
