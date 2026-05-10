'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { StorePublic } from '@/lib/types';
import { AxiosError } from 'axios';

export default function DashboardHomePage() {
  const q = useQuery({
    queryKey: ['store', 'me'],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>('/stores/me');
      return data;
    },
    retry: false,
  });

  const notFound = q.error instanceof AxiosError && q.error.response?.status === 404;

  if (q.isLoading) {
    return <p className="text-sm text-zinc-400">Cargando tu tienda…</p>;
  }

  if (notFound || !q.data) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
        <h2 className="text-xl font-semibold text-white">Aún no creaste tu tienda</h2>
        <p className="mt-3 text-sm text-zinc-400">
          Configurá nombre, slug público y datos básicos para habilitar catálogo y pedidos.
        </p>
        <Link
          href="/dashboard/tienda"
          className="mt-6 inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Crear mi tienda
        </Link>
      </div>
    );
  }

  const store = q.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{store.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{store.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/tienda/${store.slug}`}
            target="_blank"
            className="text-indigo-300 hover:text-indigo-200"
          >
            Ver tienda pública →
          </Link>
          <Link href="/dashboard/productos" className="text-zinc-400 hover:text-white">
            Gestionar productos
          </Link>
          <Link href="/dashboard/pedidos" className="text-zinc-400 hover:text-white">
            Ver pedidos
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Productos visibles</p>
          <p className="mt-2 text-3xl font-semibold">
            {store.products.filter((p) => p.visible).length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Categorías</p>
          <p className="mt-2 text-3xl font-semibold">{store.categories.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Slug</p>
          <p className="mt-2 truncate font-mono text-sm text-indigo-200">/{store.slug}</p>
        </div>
      </div>
    </div>
  );
}
