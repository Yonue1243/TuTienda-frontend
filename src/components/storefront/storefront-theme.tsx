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

/** Variables CSS fijas para toda la tienda pública (sin personalización por comercio). */
export function storefrontCssVars(): CSSProperties {
  return {
    '--sf-primary': '#6366f1',
    '--sf-secondary': '#818cf8',
    '--sf-bg': '#030712',
    '--sf-header-bg': '#030712',
    '--sf-product-card-bg': '#0a0a0f',
    '--sf-text': '#f4f4f5',
    '--sf-muted': '#a1a1aa',
    '--sf-btn': '#6366f1',
    '--sf-btn-text': '#fafafa',
    '--sf-card-border': 'rgba(244, 244, 245, 0.12)',
  } as CSSProperties;
}

export function storefrontRadiusClass(): string {
  return 'rounded-2xl';
}
