import type { CSSProperties } from 'react';
import type { StoreSettingsDto } from '@/lib/types';

export const FALLBACK_STORE_SETTINGS: StoreSettingsDto = {
  id: '',
  storeId: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#030712',
  headerBackgroundColor: '#030712',
  productCardBackgroundColor: '#18181b',
  textColor: '#f4f4f5',
  buttonColor: '#6366f1',
  buttonTextColor: '#ffffff',
  showBanner: true,
  bannerUrl: null,
  carouselEnabled: false,
  categoriesSectionEnabled: true,
  featuredSectionEnabled: true,
  descriptionSectionEnabled: true,
  layoutStyle: 'grid',
  cardStyle: 'rounded',
  cornerRadius: 'lg',
  createdAt: '',
  updatedAt: '',
};

export function mergeStoreSettings(
  server: StoreSettingsDto | null | undefined,
  draft?: Partial<StoreSettingsDto> | null,
): StoreSettingsDto {
  const base = server ?? FALLBACK_STORE_SETTINGS;
  const merged = { ...base, ...draft };
  if (!merged.headerBackgroundColor?.trim()) {
    merged.headerBackgroundColor = merged.backgroundColor;
  }
  if (!merged.productCardBackgroundColor?.trim()) {
    merged.productCardBackgroundColor = FALLBACK_STORE_SETTINGS.productCardBackgroundColor;
  }
  return merged;
}

export function storefrontCssVars(settings: StoreSettingsDto): CSSProperties {
  const headerBg =
    settings.headerBackgroundColor?.trim() || settings.backgroundColor;
  const productCardBg =
    settings.productCardBackgroundColor?.trim() ||
    FALLBACK_STORE_SETTINGS.productCardBackgroundColor;
  return {
    '--sf-primary': settings.primaryColor,
    '--sf-secondary': settings.secondaryColor,
    '--sf-bg': settings.backgroundColor,
    '--sf-header-bg': headerBg,
    '--sf-product-card-bg': productCardBg,
    '--sf-text': settings.textColor,
    '--sf-muted': `${settings.textColor}99`,
    '--sf-btn': settings.buttonColor,
    '--sf-btn-text': settings.buttonTextColor,
    '--sf-card-border': `${settings.textColor}26`,
  } as CSSProperties;
}

export function radiusClass(cornerRadius: string): string {
  switch (cornerRadius) {
    case 'sm':
      return 'rounded-lg';
    case 'md':
      return 'rounded-xl';
    default:
      return 'rounded-2xl';
  }
}
