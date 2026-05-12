'use client';

import Link from 'next/link';
import type { StorePublic, StoreSettingsDto } from '@/lib/types';
import { radiusClass } from './storefront-theme';

type Props = {
  store: StorePublic;
  settings: StoreSettingsDto;
};

/** Hero premium: banner opcional full-bleed o bloque limpio; CTAs #catalogo y tel. */
export function StorefrontHero({ store, settings }: Props) {
  const accent = settings.primaryColor;
  const hasBanner = !!(settings.showBanner && settings.bannerUrl);
  const heroDescription =
    store.description && store.description.trim().length > 0 ? store.description.trim() : null;

  const logoBlock = (
    <>
      {store.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.logoUrl}
          alt=""
          className={`${radiusClass(settings.cornerRadius)} h-16 w-16 shrink-0 object-cover shadow-lg ring-2 ring-white/15 md:h-20 md:w-20 ${hasBanner ? 'ring-white/25' : 'ring-[color:var(--sf-card-border)]'}`}
        />
      ) : (
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center text-xl font-bold shadow-lg md:h-20 md:w-24 md:text-2xl ${radiusClass(settings.cornerRadius)}`}
          style={{
            backgroundColor: `${accent}44`,
            color: accent,
          }}
        >
          {store.name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </>
  );

  const titleClass = hasBanner
    ? 'text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl'
    : 'text-3xl font-semibold tracking-tight text-[color:var(--sf-text)] sm:text-4xl lg:text-5xl';

  const descClass = hasBanner
    ? 'max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-base'
    : 'max-w-2xl text-[15px] leading-relaxed text-[color:var(--sf-muted)] sm:text-base';

  const ctas = (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <a
        href="#catalogo"
        className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold shadow-md transition hover:opacity-95 ${radiusClass(settings.cornerRadius)}`}
        style={{
          backgroundColor: 'var(--sf-btn)',
          color: 'var(--sf-btn-text)',
        }}
      >
        Ver catálogo
      </a>
      {store.phone ? (
        <a
          href={`tel:${store.phone.replace(/\s/g, '')}`}
          className={`inline-flex items-center justify-center border px-6 py-2.5 text-sm font-semibold transition hover:bg-white/10 ${radiusClass(settings.cornerRadius)} ${
            hasBanner ? 'border-white/35 text-white' : 'border-[color:var(--sf-card-border)] text-[color:var(--sf-text)]'
          }`}
        >
          Contactar
        </a>
      ) : null}
    </div>
  );

  const powered = (
    <Link
      href="/"
      className={`shrink-0 text-xs transition hover:underline ${
        hasBanner ? 'text-white/55 hover:text-white/90' : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]'
      }`}
    >
      Powered by TuTienda
    </Link>
  );

  if (hasBanner) {
    return (
      <header className="relative isolate overflow-hidden border-b border-[color:var(--sf-card-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={settings.bannerUrl!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 motion-safe:transition-opacity"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:py-16 md:flex-row md:items-end md:justify-between md:pb-16 md:pt-20 lg:py-24">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
            {logoBlock}
            <div className="min-w-0 space-y-3">
              <h1 className={titleClass}>{store.name}</h1>
              {heroDescription ? (
                <p className={`${descClass} line-clamp-4 md:line-clamp-none`}>{heroDescription}</p>
              ) : (
                <p className={`${descClass} italic opacity-80`}>Catálogo y pedidos en un solo lugar.</p>
              )}
              {store.phone && !heroDescription ? (
                <p className="text-sm text-white/75">
                  <span className="font-medium text-white/90">{store.phone}</span>
                </p>
              ) : null}
              {ctas}
            </div>
          </div>
          <div className="flex justify-end md:items-start md:pt-2">{powered}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-[color:var(--sf-card-border)] bg-[color:var(--sf-header-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row">
            {logoBlock}
            <div className="min-w-0 space-y-4">
              <h1 className={titleClass}>{store.name}</h1>
              {heroDescription ? (
                <p className={`${descClass} line-clamp-4`}>{heroDescription}</p>
              ) : (
                <p className={`${descClass} italic opacity-90`}>Explorá el catálogo y armá tu pedido.</p>
              )}
              {store.phone ? (
                <p className="text-sm">
                  <span className="text-[color:var(--sf-muted)]">Teléfono · </span>
                  <a
                    href={`tel:${store.phone.replace(/\s/g, '')}`}
                    className="font-semibold hover:underline"
                    style={{ color: 'var(--sf-primary)' }}
                  >
                    {store.phone}
                  </a>
                </p>
              ) : null}
              {ctas}
            </div>
          </div>
          <div className="shrink-0">{powered}</div>
        </div>
      </div>
    </header>
  );
}
