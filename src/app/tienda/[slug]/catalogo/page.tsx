'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { StorePublic } from '@/lib/types';
import {
  StorefrontThemeShell,
} from '@/components/storefront/storefront-public';
import { StorefrontCatalog } from '@/components/storefront/storefront-catalog';
import { useStorefrontShop } from '@/components/storefront/storefront-shop-context';
import { StorefrontPageSkeleton } from '@/components/storefront/storefront-page-skeleton';

function CatalogContent() {
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-lg text-[color:var(--sf-text)]">Tienda no encontrada</p>
        <Link href="/" className="mt-4 text-sm font-medium text-[color:var(--sf-primary)] hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const s = store.data;

  return (
    <StorefrontThemeShell settings={s.settings}>
      <header className="border-b border-[color:var(--sf-card-border)] bg-[color:var(--sf-header-bg)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/tienda/${slug}`}
            className="text-sm font-semibold text-[color:var(--sf-text)] hover:underline"
          >
            ← {s.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-[max(6rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 lg:px-8 lg:pb-28">
        <StorefrontCatalog store={s} slug={slug} onAddToCart={onAddToCart} />
      </main>
    </StorefrontThemeShell>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<StorefrontPageSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}
