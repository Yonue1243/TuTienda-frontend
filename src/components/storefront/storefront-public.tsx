'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CarouselSlideDto, ProductDto, StorePublic, StoreSettingsDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { StorefrontEmblaCarousel } from './storefront-embla';
import { storefrontCssVars, storefrontRadiusClass } from './storefront-theme';
import { CategoryProductCarousel } from './category-product-carousel';

export { StorefrontHero } from './storefront-hero';
export { StorefrontHero as StorefrontPublicHeader } from './storefront-hero';

export function StorefrontThemeShell({
  settings,
  draft,
  children,
}: {
  settings: StoreSettingsDto | null | undefined;
  draft?: Partial<StoreSettingsDto> | null;
  children: React.ReactNode;
}) {
  void settings;
  void draft;
  return (
    <div className="min-h-screen bg-[color:var(--sf-bg)] text-[color:var(--sf-text)]" style={storefrontCssVars()}>
      {children}
    </div>
  );
}

function sectionHeading(title: string, subtitle?: string) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sf-muted)]">{title}</p>
      {subtitle ? (
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--sf-text)] sm:text-2xl">{subtitle}</h2>
      ) : null}
    </div>
  );
}

const r = storefrontRadiusClass();

export function StorefrontPublicSections({
  store,
  settings: _settings,
  slides,
  slug,
  onAddToCart,
  className,
}: {
  store: StorePublic;
  settings: StoreSettingsDto;
  slides: CarouselSlideDto[];
  slug: string;
  onAddToCart?: (p: ProductDto) => void;
  className?: string;
}) {
  void _settings;
  const products = useMemo(() => store.products ?? [], [store.products]);
  const sortedCategories = useMemo(
    () => [...store.categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [store.categories],
  );

  const hasAnyFeatured = useMemo(() => products.some((p) => p.featured), [products]);
  const featuredList = useMemo(
    () => (hasAnyFeatured ? products.filter((p) => p.featured) : []),
    [products, hasAnyFeatured],
  );

  const mainProducts = useMemo(
    () => (hasAnyFeatured ? products.filter((p) => !p.featured) : products),
    [products, hasAnyFeatured],
  );

  const productsByCategory = useMemo(() => {
    const map = new Map<string, ProductDto[]>();
    for (const c of sortedCategories) {
      map.set(c.id, []);
    }
    const uncategorized: ProductDto[] = [];
    for (const p of mainProducts) {
      if (p.categoryId && map.has(p.categoryId)) {
        map.get(p.categoryId)!.push(p);
      } else {
        uncategorized.push(p);
      }
    }
    return { map, uncategorized };
  }, [mainProducts, sortedCategories]);

  const showCarousel = slides.length > 0;
  const hasCategories = sortedCategories.length > 0;
  const showDescriptionBlock = !!(store.description && store.description.trim());
  const catalogHref = `/tienda/${slug}/catalogo`;

  return (
    <div className={cn('w-full space-y-12 py-8 md:space-y-16 md:py-10', className)}>
      {showCarousel ? (
        <StorefrontEmblaCarousel
          slides={slides}
          className={`overflow-hidden shadow-md ring-1 ring-black/[0.04] ${r} border border-[color:var(--sf-card-border)]`}
        />
      ) : null}

      {showDescriptionBlock ? (
        <section className="max-w-3xl">
          <Separator className="mb-8 bg-[color:var(--sf-card-border)]" />
          <p className="text-[15px] leading-relaxed text-[color:var(--sf-muted)] sm:text-base">{store.description}</p>
        </section>
      ) : null}

      {featuredList.length > 0 ? (
        <section className="space-y-6">
          {sectionHeading('Selección', 'Destacados')}
          <CategoryProductCarousel
            title="Destacados"
            products={featuredList}
            viewAllHref={catalogHref}
            onAddToCart={onAddToCart}
          />
        </section>
      ) : null}

      <section id="catalogo" className="scroll-mt-28 space-y-10 md:scroll-mt-32 md:space-y-12">
        <Separator className="bg-[color:var(--sf-card-border)]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {sectionHeading('Tienda', 'Catálogo')}
          <Link
            href={catalogHref}
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[color:var(--sf-primary)] underline-offset-4 hover:underline"
          >
            Ver catálogo completo
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {hasCategories ? (
          <div className="space-y-10 md:space-y-12">
            {sortedCategories.map((c) => {
              const catProducts = productsByCategory.map.get(c.id) ?? [];
              if (catProducts.length === 0) return null;
              return (
                <CategoryProductCarousel
                  key={c.id}
                  title={c.name}
                  products={catProducts}
                  viewAllHref={`${catalogHref}?categoria=${c.id}`}
                  onAddToCart={onAddToCart}
                />
              );
            })}
            {productsByCategory.uncategorized.length > 0 ? (
              <CategoryProductCarousel
                title="Otros"
                products={productsByCategory.uncategorized}
                viewAllHref={catalogHref}
                onAddToCart={onAddToCart}
              />
            ) : null}
          </div>
        ) : mainProducts.length > 0 ? (
          <CategoryProductCarousel
            title="Productos"
            products={mainProducts}
            viewAllHref={catalogHref}
            onAddToCart={onAddToCart}
          />
        ) : (
          <p className="text-sm text-[color:var(--sf-muted)]">Esta tienda aún no publicó productos.</p>
        )}
      </section>
    </div>
  );
}
