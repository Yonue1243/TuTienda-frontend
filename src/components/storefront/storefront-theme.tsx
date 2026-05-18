import type { CSSProperties } from 'react';
import type { StoreSettingsDto } from '@/lib/types';

/** Valores fijos de identidad TuTienda (coinciden con tokens premium en globals). */
export const FALLBACK_STORE_SETTINGS: StoreSettingsDto = {
  id: '',
  storeId: '',
  showBanner: true,
  bannerUrl: null,
  createdAt: '',
  updatedAt: '',
};

/**
 * Solo combina ajustes de banner desde el servidor (y borrador opcional del dashboard).
 * La paleta y layout de la tienda pública son fijos en `storefrontCssVars`.
 */
export function mergeStoreSettings(
  server: StoreSettingsDto | null | undefined,
  draft?: Partial<StoreSettingsDto> | null,
): StoreSettingsDto {
  const base = server ?? FALLBACK_STORE_SETTINGS;
  return { ...base, ...draft };
}

/** Variables CSS fijas — paleta cálida premium (tienda pública). */
export function storefrontCssVars(): CSSProperties {
  return {
    '--sf-bg': '#faf8f5',
    '--sf-bg-accent': '#f3efe8',
    '--sf-surface': '#ffffff',
    '--sf-header-bg': 'rgba(255, 255, 255, 0.82)',
    '--sf-product-card-bg': '#ffffff',
    '--sf-primary': '#5b52e8',
    '--sf-secondary': '#7c75f0',
    '--sf-primary-soft': 'rgba(91, 82, 232, 0.1)',
    '--sf-text': '#1c1917',
    '--sf-muted': '#78716c',
    '--sf-btn': '#5b52e8',
    '--sf-btn-text': '#ffffff',
    '--sf-card-border': 'rgba(28, 25, 23, 0.08)',
    '--sf-shadow-sm': '0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 12px rgba(28, 25, 23, 0.04)',
    '--sf-shadow-md': '0 4px 6px rgba(28, 25, 23, 0.04), 0 12px 28px rgba(28, 25, 23, 0.08)',
    '--sf-shadow-fab': '0 8px 24px rgba(91, 82, 232, 0.28), 0 2px 8px rgba(28, 25, 23, 0.08)',
  } as CSSProperties;
}

export function storefrontRadiusClass(): string {
  return 'rounded-2xl';
}

export function storefrontSectionClass(): string {
  return 'space-y-10 md:space-y-12';
}

/** Fondo de página con profundidad sutil (gradiente cálido). */
export function storefrontPageBackgroundClass(): string {
  return 'min-h-screen bg-[color:var(--sf-bg)] text-[color:var(--sf-text)] [background-image:radial-gradient(ellipse_120%_80%_at_50%_-20%,var(--sf-bg-accent),transparent_55%),linear-gradient(180deg,var(--sf-bg)_0%,#f5f1eb_100%)]';
}
