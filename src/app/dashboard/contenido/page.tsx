'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '@/lib/api';
import type { CarouselSlideDto, ProductDto, StorePublic } from '@/lib/types';
import { extensionFromFileName } from '@/lib/storage-upload';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContenidoPage() {
  const qc = useQueryClient();

  const storeQ = useQuery({
    queryKey: ['store', 'me'],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>('/stores/me');
      return data;
    },
    retry: false,
  });

  const productsQ = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<ProductDto[]>('/products');
      return data;
    },
    enabled: !!storeQ.data,
  });

  const notFound = storeQ.error instanceof AxiosError && storeQ.error.response?.status === 404;

  const sortedSlides = useMemo(
    () => [...(storeQ.data?.carouselSlides ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [storeQ.data?.carouselSlides],
  );

  const toggleFeaturedMu = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { data } = await api.patch<ProductDto>(`/products/${id}`, { featured });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

  const createSlideMu = useMutation({
    mutationFn: async (body: {
      imageUrl: string;
      title?: string | null;
      subtitle?: string | null;
      ctaLabel?: string | null;
      ctaHref?: string | null;
    }) => {
      const { data } = await api.post<CarouselSlideDto>('/stores/me/carousel-slides', body);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

  const deleteSlideMu = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stores/me/carousel-slides/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideCtaLabel, setSlideCtaLabel] = useState('');
  const [slideCtaHref, setSlideCtaHref] = useState('');
  const [slideImageUrl, setSlideImageUrl] = useState<string | null>(null);

  if (storeQ.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-9 w-48 bg-white/[0.06]" />
        <Skeleton className="h-64 rounded-xl bg-white/[0.06]" />
        <Skeleton className="h-64 rounded-xl bg-white/[0.06]" />
      </div>
    );
  }

  if (notFound || !storeQ.data) {
    return (
      <Card className="mx-auto max-w-lg border-white/[0.06] bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle>Creá tu tienda primero</CardTitle>
          <CardDescription>El contenido del carrusel y categorías está disponible con una tienda activa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="rounded-full shadow-none">
            <Link href="/dashboard/tienda">Ir a Mi tienda</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const store = storeQ.data;

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <PageHeader
        title="Contenido de la vitrina"
        description={
          <>
            Carrusel y productos destacados. Las categorías y su orden las gestionás en{' '}
            <Link className="font-medium text-indigo-400 underline-offset-2 hover:underline" href="/dashboard/categorias">
              Categorías
            </Link>
            .
          </>
        }
      />

      <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Carrusel</CardTitle>
          <CardDescription>
            Si hay al menos un slide, se muestra en tu tienda pública. Cada slide requiere imagen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white">Slides</p>
            {sortedSlides.length === 0 ? (
              <p className="text-sm text-zinc-500">Todavía no cargaste slides.</p>
            ) : (
              <ul className="space-y-2">
                {sortedSlides.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-zinc-300">{s.title || s.imageUrl}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deleteSlideMu.isPending}
                      onClick={() => deleteSlideMu.mutate(s.id)}
                    >
                      Eliminar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-zinc-800 pt-6">
            <p className="text-sm font-medium text-white">Nuevo slide</p>
            <ImageDropzone
              label="Imagen"
              bucket="carousel"
              buildPath={(file) =>
                `${store.id}/slide-${Date.now()}${extensionFromFileName(file.name)}`
              }
              value={slideImageUrl ?? ''}
              onChange={(url) => setSlideImageUrl(url || null)}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slide-title">Título</Label>
                <Input
                  id="slide-title"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="border-zinc-800 bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-sub">Subtítulo</Label>
                <Input
                  id="slide-sub"
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  className="border-zinc-800 bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-cta">Texto CTA</Label>
                <Input
                  id="slide-cta"
                  value={slideCtaLabel}
                  onChange={(e) => setSlideCtaLabel(e.target.value)}
                  className="border-zinc-800 bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-href">Enlace CTA</Label>
                <Input
                  id="slide-href"
                  value={slideCtaHref}
                  onChange={(e) => setSlideCtaHref(e.target.value)}
                  className="border-zinc-800 bg-zinc-950"
                />
              </div>
            </div>
            <Button
              type="button"
              disabled={createSlideMu.isPending || !slideImageUrl || slideImageUrl.trim() === ''}
              onClick={() => {
                if (!slideImageUrl) return;
                createSlideMu.mutate(
                  {
                    imageUrl: slideImageUrl.trim(),
                    title: slideTitle || null,
                    subtitle: slideSubtitle || null,
                    ctaLabel: slideCtaLabel || null,
                    ctaHref: slideCtaHref || null,
                  },
                  {
                    onSuccess: () => {
                      setSlideTitle('');
                      setSlideSubtitle('');
                      setSlideCtaLabel('');
                      setSlideCtaHref('');
                      setSlideImageUrl(null);
                    },
                  },
                );
              }}
            >
              Agregar slide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Productos destacados</CardTitle>
          <CardDescription>Aparecen en la sección Destacados si hay al menos uno marcado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {(productsQ.data ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">No hay productos cargados.</p>
          ) : (
            (productsQ.data ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">
                    {p.visible === false ? 'Oculto en tienda' : 'Visible'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Destacado</span>
                  <Switch
                    checked={!!p.featured}
                    disabled={toggleFeaturedMu.isPending}
                    onCheckedChange={(v) => toggleFeaturedMu.mutate({ id: p.id, featured: v })}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
