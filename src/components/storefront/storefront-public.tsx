'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { CarouselSlideDto, ProductDto, StorePublic, StoreSettingsDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { Separator } from '@/components/ui/separator';
import { StorefrontEmblaCarousel } from './storefront-embla';
import { storefrontCssVars, storefrontRadiusClass } from './storefront-theme';

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

function ProductCard({ product, onAdd }: { product: ProductDto; onAdd?: () => void }) {
  const qty = useCartStore((s) => {
    const line = s.items.find((i) => i.productId === product.id);
    return line?.quantity ?? 0;
  });
  const setQty = useCartStore((s) => s.setQty);

  const outOfStock = product.stock === 0;
  const maxStock = product.stock;
  const atMaxStock = maxStock != null && qty >= maxStock;

  const handleFirstAdd = () => {
    if (outOfStock || !onAdd) return;
    onAdd();
  };

  const handlePlus = () => {
    if (outOfStock || atMaxStock) return;
    if (qty === 0) {
      handleFirstAdd();
      return;
    }
    setQty(product.id, qty + 1);
  };

  const handleMinus = () => {
    if (qty < 1) return;
    setQty(product.id, qty - 1);
  };

  const showAddZone = Boolean(onAdd) || outOfStock;

  return (
    <article
      className={cn(
        `flex h-full flex-col overflow-hidden border ${r} border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] shadow-sm ring-1 ring-black/[0.03] motion-safe:transition-[box-shadow,ring-color] motion-safe:duration-200 motion-safe:ease-out`,
        'hover:shadow-md hover:ring-black/[0.05]',
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        {product.featured ? (
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${r}`}
            >
              Destacado
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        <div className="space-y-2">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-[color:var(--sf-text)] sm:text-base">
            {product.name}
          </h3>
          {product.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-[color:var(--sf-muted)]">{product.description}</p>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-[color:var(--sf-card-border)]/80 pt-4">
          <p className="text-lg font-semibold tabular-nums text-[color:var(--sf-primary)] sm:text-xl">
            ${Number(product.price).toFixed(2)}
          </p>
          {showAddZone ? (
            outOfStock ? (
              <Button
                type="button"
                size="sm"
                disabled
                className={cn(
                  'cursor-not-allowed rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] px-4 text-xs font-semibold text-[color:var(--sf-muted)] opacity-90',
                  r,
                )}
              >
                Sin stock
              </Button>
            ) : qty >= 1 ? (
              <div
                className={cn(
                  'inline-flex h-9 items-stretch overflow-hidden rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] text-[color:var(--sf-text)] shadow-sm ring-1 ring-black/[0.04] motion-safe:transition-shadow motion-safe:duration-200',
                  r,
                )}
                role="group"
                aria-label={`Cantidad de ${product.name} en el carrito`}
              >
                <button
                  type="button"
                  onClick={handleMinus}
                  className={cn(
                    'flex w-9 shrink-0 items-center justify-center motion-safe:transition-colors motion-safe:active:scale-[0.96]',
                    'hover:bg-black/[0.04] focus-visible:z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--sf-primary)]',
                  )}
                  aria-label="Quitar una unidad"
                >
                  <Minus className="size-4" aria-hidden strokeWidth={2.25} />
                </button>
                <span className="flex min-w-[1.75rem] items-center justify-center border-x border-[color:var(--sf-card-border)]/80 px-1 text-xs font-bold tabular-nums text-[color:var(--sf-text)]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  disabled={atMaxStock}
                  className={cn(
                    'flex w-9 shrink-0 items-center justify-center motion-safe:transition-colors motion-safe:active:scale-[0.96]',
                    'hover:bg-black/[0.04] focus-visible:z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--sf-primary)]',
                    atMaxStock && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                  )}
                  aria-label="Agregar una unidad"
                >
                  <Plus className="size-4" aria-hidden strokeWidth={2.25} />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleFirstAdd}
                aria-live="polite"
                className={cn(
                  'min-w-[6.25rem] gap-1.5 rounded-full border-0 px-4 text-xs font-semibold shadow-sm motion-safe:transition-[transform,opacity,box-shadow] motion-safe:duration-200 motion-safe:ease-out motion-safe:active:scale-[0.97]',
                  'hover:opacity-95 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-product-card-bg)]',
                  r,
                )}
                style={{
                  backgroundColor: 'var(--sf-btn)',
                  color: 'var(--sf-btn-text)',
                }}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Plus className="size-4 shrink-0" aria-hidden />
                  Agregar
                </span>
              </Button>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProductGrid({ products, onAdd }: { products: ProductDto[]; onAdd?: (p: ProductDto) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd ? () => onAdd(p) : undefined} />
      ))}
    </div>
  );
}

export function StorefrontPublicSections({
  store,
  settings: _settings,
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
  void _settings;
  const products = useMemo(() => store.products ?? [], [store.products]);
  const sortedCategories = useMemo(
    () => [...store.categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [store.categories],
  );
  const [tab, setTab] = useState<string>('all');

  const hasAnyFeatured = useMemo(() => products.some((p) => p.featured), [products]);
  const featuredList = useMemo(
    () => (hasAnyFeatured ? products.filter((p) => p.featured) : []),
    [products, hasAnyFeatured],
  );

  const mainProducts = useMemo(
    () => (hasAnyFeatured ? products.filter((p) => !p.featured) : products),
    [products, hasAnyFeatured],
  );

  const filteredMain = useMemo(() => {
    if (tab === 'all') return mainProducts;
    return mainProducts.filter((p) => p.categoryId === tab);
  }, [mainProducts, tab]);

  const showCarousel = slides.length > 0;
  const hasCategories = sortedCategories.length > 0;
  const showDescriptionBlock = !!(store.description && store.description.trim());

  const tabBase =
    'shrink-0 rounded-full px-4 py-2.5 text-sm font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)] sm:px-5';

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
        <section className="space-y-8">
          {sectionHeading('Selección', 'Destacados')}
          <ProductGrid products={featuredList} onAdd={onAddToCart} />
        </section>
      ) : null}

      {hasCategories ? (
        <section id="catalogo" className="scroll-mt-28 space-y-8 md:scroll-mt-32">
          <Separator className="bg-[color:var(--sf-card-border)]" />
          {sectionHeading('Tienda', 'Catálogo')}
          <div className="relative -mx-1">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-[color:var(--sf-bg)] to-transparent sm:w-8"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-[color:var(--sf-bg)] to-transparent sm:w-8"
              aria-hidden
            />
            <div
              role="tablist"
              aria-label="Categorías del catálogo"
              className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="inline-flex min-h-12 w-max flex-nowrap gap-1.5 rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)]/70 p-1.5 shadow-sm backdrop-blur-sm">
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
          </div>
          <div>
            <ProductGrid products={filteredMain} onAdd={onAddToCart} />
          </div>
          {filteredMain.length === 0 ? (
            <p className="text-sm text-[color:var(--sf-muted)]">No hay productos en esta vista.</p>
          ) : null}
        </section>
      ) : (
        <section id="catalogo" className="scroll-mt-28 space-y-8 md:scroll-mt-32">
          <Separator className="bg-[color:var(--sf-card-border)]" />
          {sectionHeading('Tienda', 'Productos')}
          <ProductGrid products={products} onAdd={onAddToCart} />
          {products.length === 0 ? (
            <p className="text-sm text-[color:var(--sf-muted)]">Esta tienda aún no publicó productos.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
