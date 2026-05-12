'use client';

import { useMemo, useState } from 'react';
import type { CarouselSlideDto, ProductDto, StorePublic, StoreSettingsDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { StorefrontEmblaCarousel } from './storefront-embla';
import { mergeStoreSettings, radiusClass, storefrontCssVars } from './storefront-theme';

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
  const effective = mergeStoreSettings(settings, draft);
  return (
    <div className="min-h-screen bg-[color:var(--sf-bg)] text-[color:var(--sf-text)]" style={storefrontCssVars(effective)}>
      {children}
    </div>
  );
}

function sectionHeading(title: string, subtitle?: string) {
  return (
    <div className="space-y-1">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sf-muted)]">{title}</h2>
      {subtitle ? <p className="text-lg font-semibold tracking-tight text-[color:var(--sf-text)]">{subtitle}</p> : null}
    </div>
  );
}

function ProductCard({
  product,
  settings,
  onAdd,
}: {
  product: ProductDto;
  settings: StoreSettingsDto;
  onAdd?: () => void;
}) {
  const r = radiusClass(settings.cornerRadius);
  const flat = settings.cardStyle === 'flat';
  const priceColor = settings.secondaryColor;
  return (
    <article
      className={cn(
        `group/card overflow-hidden border ${r} border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] motion-safe:transition motion-safe:duration-200`,
        flat ? '' : 'shadow-sm ring-1 ring-black/[0.04]',
        'hover:-translate-y-0.5 hover:shadow-md hover:ring-black/[0.06]',
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-black/10 sm:aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover/card:scale-[1.04]"
        />
        {product.featured ? (
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center rounded-full border border-[color:var(--sf-card-border)] bg-black/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--sf-primary)] backdrop-blur-sm ${r}`}
            >
              Destacado
            </span>
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold leading-snug tracking-tight sm:text-lg">{product.name}</h3>
          {product.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">{product.description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <p className="text-lg font-semibold tabular-nums sm:text-xl" style={{ color: priceColor }}>
            ${Number(product.price).toFixed(2)}
          </p>
          {onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className={`px-4 py-2 text-xs font-semibold shadow-sm motion-safe:transition motion-safe:duration-200 hover:brightness-105 active:scale-[0.98] ${r}`}
              style={{
                backgroundColor: 'var(--sf-btn)',
                color: 'var(--sf-btn-text)',
              }}
            >
              Agregar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProductGrid({
  products,
  settings,
  onAdd,
}: {
  products: ProductDto[];
  settings: StoreSettingsDto;
  onAdd?: (p: ProductDto) => void;
}) {
  const list = settings.layoutStyle === 'list';
  return (
    <div className={list ? 'flex flex-col gap-5' : 'grid gap-5 sm:grid-cols-2'}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} settings={settings} onAdd={onAdd ? () => onAdd(p) : undefined} />
      ))}
    </div>
  );
}

export function StorefrontPublicSections({
  store,
  settings,
  slides,
  onAddToCart,
  className,
}: {
  store: StorePublic;
  settings: StoreSettingsDto;
  slides: CarouselSlideDto[];
  onAddToCart?: (p: ProductDto) => void;
  className?: string;
}) {
  const products = useMemo(() => store.products ?? [], [store.products]);
  const sortedCategories = useMemo(
    () => [...store.categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [store.categories],
  );
  const [tab, setTab] = useState<string>('all');

  const featuredList = useMemo(
    () => (settings.featuredSectionEnabled ? products.filter((p) => p.featured) : []),
    [products, settings.featuredSectionEnabled],
  );

  const mainProducts = useMemo(
    () => (settings.featuredSectionEnabled ? products.filter((p) => !p.featured) : products),
    [products, settings.featuredSectionEnabled],
  );

  const filteredMain = useMemo(() => {
    if (tab === 'all') return mainProducts;
    return mainProducts.filter((p) => p.categoryId === tab);
  }, [mainProducts, tab]);

  const showCarousel = settings.carouselEnabled && slides.length > 0;

  const tabBase =
    'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)]';

  return (
    <div className={cn('mx-auto max-w-6xl space-y-12 px-6 py-10 md:space-y-14 md:py-12', className)}>
      {showCarousel ? (
        <StorefrontEmblaCarousel
          slides={slides}
          className={`overflow-hidden ${radiusClass(settings.cornerRadius)} border border-[color:var(--sf-card-border)] shadow-sm`}
        />
      ) : null}

      {settings.descriptionSectionEnabled && store.description ? (
        <>
          <section className="max-w-3xl">
            <Separator className="mb-8 bg-[color:var(--sf-card-border)]" />
            <p className="text-[15px] leading-relaxed text-[color:var(--sf-muted)] sm:text-base">{store.description}</p>
          </section>
        </>
      ) : null}

      {settings.featuredSectionEnabled && featuredList.length > 0 ? (
        <section className="space-y-6">
          {sectionHeading('Selección', 'Destacados')}
          <ProductGrid products={featuredList} settings={settings} onAdd={onAddToCart} />
        </section>
      ) : null}

      {settings.categoriesSectionEnabled ? (
        <section id="catalogo" className="scroll-mt-24 space-y-6">
          <Separator className="bg-[color:var(--sf-card-border)]" />
          {sectionHeading('Tienda', 'Catálogo')}
          <div
            role="tablist"
            aria-label="Categorías del catálogo"
            className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex min-h-11 w-max flex-nowrap gap-1 rounded-xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)]/60 p-1">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'all'}
                id="sf-tab-all"
                className={cn(
                  tabBase,
                  tab === 'all'
                    ? 'bg-[color:var(--sf-primary)] text-[color:var(--sf-btn-text)] shadow-sm'
                    : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]',
                )}
                onClick={() => setTab('all')}
              >
                Todos
              </button>
              {sortedCategories.map((c) => {
                const selected = tab === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`sf-tab-${c.id}`}
                    className={cn(
                      tabBase,
                      selected
                        ? 'bg-[color:var(--sf-primary)] text-[color:var(--sf-btn-text)] shadow-sm'
                        : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]',
                    )}
                    onClick={() => setTab(c.id)}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pt-2">
            <ProductGrid products={filteredMain} settings={settings} onAdd={onAddToCart} />
          </div>
          {filteredMain.length === 0 ? (
            <p className="text-sm text-[color:var(--sf-muted)]">No hay productos en esta vista.</p>
          ) : null}
        </section>
      ) : (
        <section id="catalogo" className="scroll-mt-24 space-y-6">
          <Separator className="bg-[color:var(--sf-card-border)]" />
          {sectionHeading('Tienda', 'Productos')}
          <ProductGrid products={products} settings={settings} onAdd={onAddToCart} />
          {products.length === 0 ? (
            <p className="text-sm text-[color:var(--sf-muted)]">Esta tienda aún no publicó productos.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
