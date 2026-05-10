'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CarouselSlideDto, ProductDto, StorePublic, StoreSettingsDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StorefrontEmblaCarousel } from './storefront-embla';
import { mergeStoreSettings, radiusClass, storefrontCssVars } from './storefront-theme';

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

export function StorefrontPublicHeader({
  store,
  settings,
}: {
  store: StorePublic;
  settings: StoreSettingsDto;
}) {
  const accent = settings.primaryColor;
  return (
    <header className="border-b border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-8">
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt=""
            className={`${radiusClass(settings.cornerRadius)} h-14 w-14 object-cover ring-1 ring-[color:var(--sf-card-border)]`}
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center ${radiusClass(settings.cornerRadius)} text-lg font-bold`}
            style={{
              backgroundColor: `${accent}33`,
              color: accent,
            }}
          >
            {store.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{store.name}</h1>
          {store.phone ? (
            <p className="mt-3">
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--sf-muted)]">
                Contacto
              </span>
              <br />
              <a
                href={`tel:${store.phone.replace(/\s/g, '')}`}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--sf-primary)' }}
              >
                {store.phone}
              </a>
            </p>
          ) : null}
        </div>
        <Link href="/" className="text-sm text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]">
          Powered by Tu Tienda
        </Link>
      </div>
    </header>
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
      className={`overflow-hidden border ${r} ${
        flat
          ? 'border-[color:var(--sf-card-border)] bg-transparent'
          : 'border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)]/60 shadow-sm ring-1 ring-black/5'
      }`}
    >
      <div className={`aspect-[4/3] bg-black/10 ${flat ? '' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold">{product.name}</h3>
          {product.description ? (
            <p className="mt-1 line-clamp-3 text-xs text-[color:var(--sf-muted)]">{product.description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold" style={{ color: priceColor }}>
            ${Number(product.price).toFixed(2)}
          </p>
          {onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className={`px-4 py-2 text-xs font-semibold ${r}`}
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
    <div className={list ? 'flex flex-col gap-4' : 'grid gap-4 sm:grid-cols-2'}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          settings={settings}
          onAdd={onAdd ? () => onAdd(p) : undefined}
        />
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
  const [tab, setTab] = useState<string | 'all'>('all');

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

  return (
    <div className={cn('mx-auto max-w-6xl space-y-10 px-6 py-10', className)}>
      {settings.showBanner && settings.bannerUrl ? (
        <div className={`overflow-hidden ${radiusClass(settings.cornerRadius)} border border-[color:var(--sf-card-border)]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.bannerUrl} alt="" className="max-h-[320px] w-full object-cover" />
        </div>
      ) : null}

      {showCarousel ? (
        <StorefrontEmblaCarousel
          slides={slides}
          className={`overflow-hidden ${radiusClass(settings.cornerRadius)} border border-[color:var(--sf-card-border)]`}
        />
      ) : null}

      {settings.descriptionSectionEnabled && store.description ? (
        <p className="max-w-3xl text-sm leading-relaxed text-[color:var(--sf-muted)]">{store.description}</p>
      ) : null}

      {settings.featuredSectionEnabled && featuredList.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--sf-muted)]">
            Destacados
          </h2>
          <div className="mt-4">
            <ProductGrid products={featuredList} settings={settings} onAdd={onAddToCart} />
          </div>
        </section>
      ) : null}

      {settings.categoriesSectionEnabled ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--sf-muted)]">
            Catálogo
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                tab === 'all'
                  ? 'text-[color:var(--sf-btn-text)]'
                  : 'border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)] text-[color:var(--sf-muted)] hover:bg-white/5'
              }`}
              style={tab === 'all' ? { backgroundColor: 'var(--sf-primary)' } : undefined}
            >
              Todos
            </button>
            {sortedCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tab === c.id
                    ? 'text-[color:var(--sf-btn-text)]'
                    : 'border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)] text-[color:var(--sf-muted)] hover:bg-white/5'
                }`}
                style={tab === c.id ? { backgroundColor: 'var(--sf-primary)' } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <ProductGrid products={filteredMain} settings={settings} onAdd={onAddToCart} />
          </div>
          {filteredMain.length === 0 ? (
            <p className="mt-6 text-sm text-[color:var(--sf-muted)]">No hay productos en esta vista.</p>
          ) : null}
        </section>
      ) : (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--sf-muted)]">
            Productos
          </h2>
          <div className="mt-6">
            <ProductGrid products={products} settings={settings} onAdd={onAddToCart} />
          </div>
          {products.length === 0 ? (
            <p className="mt-6 text-sm text-[color:var(--sf-muted)]">Esta tienda aún no publicó productos.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
