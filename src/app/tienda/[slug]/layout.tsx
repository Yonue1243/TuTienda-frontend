'use client';

import { StorefrontShopShell } from '@/components/storefront/storefront-shop-context';

export default function TiendaSlugLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontShopShell>{children}</StorefrontShopShell>;
}
