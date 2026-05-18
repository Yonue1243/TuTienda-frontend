'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ExternalLink, FolderTree, Package, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { StorePublic } from '@/lib/types';
import { AxiosError } from 'axios';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardEmptyState } from '@/components/dashboard/empty-state';

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
    return (
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <Skeleton className="h-9 w-48 bg-white/[0.06]" />
          <Skeleton className="h-4 w-full max-w-lg bg-white/[0.06]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !q.data) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Resumen"
          description="Cuando crees tu tienda verás métricas y accesos rápidos acá."
        />
        <DashboardEmptyState
          icon={Sparkles}
          title="Aún no creaste tu tienda"
          description="Configurá nombre, slug público y datos básicos para habilitar catálogo y pedidos."
          action={{ label: 'Crear mi tienda', href: '/dashboard/tienda' }}
        />
      </div>
    );
  }

  const store = q.data;
  const visibleCount = store.products.filter((p) => p.visible).length;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <PageHeader
        title={store.name}
        description={store.description ?? 'Sin descripción pública.'}
        actions={
          <Button variant="outline" size="sm" className="rounded-full border-white/[0.1]" asChild>
            <Link href={`/tienda/${store.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Tienda pública
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <Package className="size-3.5 opacity-70" />
              Productos visibles
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-white">
              {visibleCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <FolderTree className="size-3.5 opacity-70" />
              Categorías
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-white">
              {store.categories.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Slug</p>
            <p className="mt-3 truncate font-mono text-sm text-zinc-300">/{store.slug}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-8">
        <Button variant="secondary" className="rounded-full shadow-none" size="sm" asChild>
          <Link href="/dashboard/productos">Gestionar productos</Link>
        </Button>
        <Button variant="secondary" className="rounded-full shadow-none" size="sm" asChild>
          <Link href="/dashboard/categorias">Gestionar categorías</Link>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-zinc-400 hover:text-white" asChild>
          <Link href="/dashboard/pedidos">Ver pedidos</Link>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-zinc-400 hover:text-white" asChild>
          <Link href="/dashboard/contenido">Contenido</Link>
        </Button>
      </div>
    </div>
  );
}
