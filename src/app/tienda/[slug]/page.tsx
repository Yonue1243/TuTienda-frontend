'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { StorePublic, StoreSettingsDto } from '@/lib/types';
import {
  StorefrontHero,
  StorefrontPublicSections,
  StorefrontThemeShell,
} from '@/components/storefront/storefront-public';
import { useStorefrontShop } from '@/components/storefront/storefront-shop-context';
import { mergeStoreSettings } from '@/components/storefront/storefront-theme';
import { StorefrontPageSkeleton } from '@/components/storefront/storefront-page-skeleton';

export default function PublicTiendaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  const { onAddToCart } = useStorefrontShop();

  const store = useQuery({
    queryKey: ['store', 'public', slug],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>(`/stores/by-slug/${slug}`);
      return data;
    },
  });

  if (store.isLoading) {
    return <StorefrontPageSkeleton />;
  }

  if (store.error || !store.data) {
    return (
      <StorefrontThemeShell settings={null}>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <p className="text-lg font-medium text-[color:var(--sf-text)]">Tienda no encontrada</p>
          <Link
            href="/"
            className="mt-4 text-sm font-medium text-[color:var(--sf-primary)] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </StorefrontThemeShell>
    );
  }

  const s = store.data;
  const settings: StoreSettingsDto = mergeStoreSettings(s.settings);
  const slides = [...(s.carouselSlides ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <StorefrontThemeShell settings={s.settings}>
      <StorefrontHero store={s} settings={settings} slug={slug} />

      <main className="mx-auto max-w-7xl px-4 pb-[max(6rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 md:pt-10 lg:px-8 lg:pb-28 lg:pt-12">
        <StorefrontPublicSections
          className="mx-0 max-w-none px-0 py-0"
          store={s}
          settings={settings}
          slides={slides}
          slug={slug}
          onAddToCart={onAddToCart}
        />
      </main>
    </StorefrontThemeShell>
  );
}
