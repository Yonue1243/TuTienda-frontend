'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { ProductDto, StorePublic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { StorefrontProductCard } from './storefront-product-card';

type Props = {
  store: StorePublic;
  slug: string;
  onAddToCart?: (p: ProductDto) => void;
};

export function StorefrontCatalog({ store, slug, onAddToCart }: Props) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria') ?? 'all';

  const [categoryId, setCategoryId] = useState(initialCategory);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setCategoryId(initialCategory);
  }, [initialCategory]);

  const products = useMemo(() => store.products ?? [], [store.products]);
  const sortedCategories = useMemo(
    () => [...store.categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [store.categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== 'all') {
        if (categoryId === 'none') {
          if (p.categoryId) return false;
        } else if (p.categoryId !== categoryId) {
          return false;
        }
      }
      if (!q) return true;
      const inName = p.name.toLowerCase().includes(q);
      const inDesc = (p.description ?? '').toLowerCase().includes(q);
      return inName || inDesc;
    });
  }, [products, categoryId, query]);

  const hasUncategorized = products.some((p) => !p.categoryId);
  const chipBase =
    'shrink-0 rounded-full px-4 py-2 text-sm font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)]';

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-[color:var(--sf-muted)]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/tienda/${slug}`} className="font-medium hover:text-[color:var(--sf-text)] hover:underline">
              {store.name}
            </Link>
          </li>
          <li aria-hidden className="text-[color:var(--sf-muted)]/60">
            /
          </li>
          <li className="font-medium text-[color:var(--sf-text)]" aria-current="page">
            Catálogo
          </li>
        </ol>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--sf-text)] sm:text-3xl">
          Catálogo completo
        </h1>
        <p className="max-w-2xl text-sm text-[color:var(--sf-muted)] sm:text-base">
          Explorá todos los productos, filtrá por categoría o buscá por nombre.
        </p>
      </header>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--sf-muted)]"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos…"
            className="h-10 border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] pl-9 text-sm"
            aria-label="Buscar en el catálogo"
          />
        </div>

        <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-h-10 w-max flex-nowrap gap-1.5 rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)]/70 p-1.5">
            <button
              type="button"
              className={cn(
                chipBase,
                categoryId === 'all'
                  ? 'bg-[color:var(--sf-primary)] text-[color:var(--sf-btn-text)] shadow-sm'
                  : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]',
              )}
              onClick={() => setCategoryId('all')}
            >
              Todas
            </button>
            {sortedCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cn(
                  chipBase,
                  categoryId === c.id
                    ? 'bg-[color:var(--sf-primary)] text-[color:var(--sf-btn-text)] shadow-sm'
                    : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]',
                )}
                onClick={() => setCategoryId(c.id)}
              >
                {c.name}
              </button>
            ))}
            {hasUncategorized ? (
              <button
                type="button"
                className={cn(
                  chipBase,
                  categoryId === 'none'
                    ? 'bg-[color:var(--sf-primary)] text-[color:var(--sf-btn-text)] shadow-sm'
                    : 'text-[color:var(--sf-muted)] hover:text-[color:var(--sf-text)]',
                )}
                onClick={() => setCategoryId('none')}
              >
                Otros
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-[color:var(--sf-muted)]">
          No hay productos que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:gap-6">
          {filtered.map((p) => (
            <StorefrontProductCard
              key={p.id}
              product={p}
              variant="grid"
              onAdd={onAddToCart ? () => onAddToCart(p) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
