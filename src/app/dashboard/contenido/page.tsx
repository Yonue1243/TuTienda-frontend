'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Pencil } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const [editSlideOpen, setEditSlideOpen] = useState(false);
  const [editSlideId, setEditSlideId] = useState<string | null>(null);
  const [editSlideImageUrl, setEditSlideImageUrl] = useState('');
  const [editSlideTitle, setEditSlideTitle] = useState('');
  const [editSlideSubtitle, setEditSlideSubtitle] = useState('');
  const [editSlideCtaLabel, setEditSlideCtaLabel] = useState('');
  const [editSlideCtaHref, setEditSlideCtaHref] = useState('');

  const closeEditSlide = () => {
    setEditSlideOpen(false);
    setEditSlideId(null);
    setEditSlideImageUrl('');
    setEditSlideTitle('');
    setEditSlideSubtitle('');
    setEditSlideCtaLabel('');
    setEditSlideCtaHref('');
  };

  const updateSlideMu = useMutation({
    mutationFn: async (payload: {
      id: string;
      imageUrl: string;
      title: string | null;
      subtitle: string | null;
      ctaLabel: string | null;
      ctaHref: string | null;
    }) => {
      const { id, ...body } = payload;
      const { data } = await api.patch<CarouselSlideDto>(`/stores/me/carousel-slides/${id}`, body);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
      closeEditSlide();
    },
  });

  const openEditSlide = (s: CarouselSlideDto) => {
    updateSlideMu.reset();
    setEditSlideId(s.id);
    setEditSlideImageUrl(s.imageUrl);
    setEditSlideTitle(s.title ?? '');
    setEditSlideSubtitle(s.subtitle ?? '');
    setEditSlideCtaLabel(s.ctaLabel ?? '');
    setEditSlideCtaHref(s.ctaHref ?? '');
    setEditSlideOpen(true);
  };

  if (storeQ.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-9 w-48 bg-white/[0.06]" />
        <Skeleton className="h-10 w-full max-w-md rounded-lg bg-white/[0.06]" />
        <Skeleton className="h-72 rounded-xl bg-white/[0.06]" />
      </div>
    );
  }

  if (notFound || !storeQ.data) {
    return (
      <Card className="mx-auto max-w-lg border-white/[0.06] bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle>Creá tu tienda primero</CardTitle>
          <CardDescription>Carrusel y destacados con una tienda activa.</CardDescription>
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
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <PageHeader
        className="border-b border-white/[0.06] pb-6"
        title="Contenido"
        description={
          <span className="text-muted-foreground">
            Carrusel de inicio y productos en vitrina. Categorías:{' '}
            <Link className="font-medium text-indigo-400 underline-offset-2 hover:underline" href="/dashboard/categorias">
              Categorías
            </Link>
            .
          </span>
        }
      />

      <Tabs defaultValue="carousel" className="w-full">
        <TabsList className="grid h-10 w-full max-w-xs grid-cols-2 border border-white/[0.08] bg-zinc-900/90 p-1 sm:max-w-sm">
          <TabsTrigger
            value="carousel"
            className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=inactive]:text-zinc-500"
          >
            Carrusel
          </TabsTrigger>
          <TabsTrigger
            value="featured"
            className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=inactive]:text-zinc-500"
          >
            Destacados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carousel" className="mt-4 focus-visible:outline-none">
          <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
            <CardHeader className="space-y-1 pb-3 pt-4">
              <CardTitle className="text-base font-semibold">Carrusel de inicio</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Con al menos un slide se muestra arriba del catálogo. Cada slide requiere imagen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 pt-0 sm:px-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Slides actuales</p>
                {sortedSlides.length === 0 ? (
                  <p className="text-sm text-zinc-500">Ninguno todavía.</p>
                ) : (
                  <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                    {sortedSlides.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-1.5 text-sm"
                      >
                        <span className="min-w-0 truncate text-zinc-300">{s.title || 'Slide sin título'}</span>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 shrink-0 gap-1 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            disabled={deleteSlideMu.isPending || updateSlideMu.isPending}
                            onClick={() => openEditSlide(s)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 shrink-0 px-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            disabled={deleteSlideMu.isPending || updateSlideMu.isPending}
                            onClick={() => deleteSlideMu.mutate(s.id)}
                          >
                            Quitar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-zinc-800/80 pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Agregar slide</p>
                <div className="space-y-3">
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
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="slide-title" className="text-xs">
                        Título
                      </Label>
                      <Input
                        id="slide-title"
                        value={slideTitle}
                        onChange={(e) => setSlideTitle(e.target.value)}
                        className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="slide-sub" className="text-xs">
                        Subtítulo
                      </Label>
                      <Input
                        id="slide-sub"
                        value={slideSubtitle}
                        onChange={(e) => setSlideSubtitle(e.target.value)}
                        className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                      />
                    </div>
                  </div>

                  <details className="group rounded-lg border border-zinc-800/80 bg-zinc-950/30 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer list-none px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200">
                      <span className="mr-1 text-zinc-600 group-open:rotate-90">▸</span>
                      Botón y enlace (opcional)
                    </summary>
                    <div className="grid gap-2 border-t border-zinc-800/60 px-3 py-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="slide-cta" className="text-xs">
                          Texto del botón
                        </Label>
                        <Input
                          id="slide-cta"
                          value={slideCtaLabel}
                          onChange={(e) => setSlideCtaLabel(e.target.value)}
                          className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="slide-href" className="text-xs">
                          URL del botón
                        </Label>
                        <Input
                          id="slide-href"
                          value={slideCtaHref}
                          onChange={(e) => setSlideCtaHref(e.target.value)}
                          className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                          placeholder="https://…"
                        />
                      </div>
                    </div>
                  </details>

                  <Button
                    type="button"
                    size="sm"
                    className="w-full rounded-full sm:w-auto"
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
                    {createSlideMu.isPending ? 'Guardando…' : 'Agregar slide'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="mt-4 focus-visible:outline-none">
          <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
            <CardHeader className="space-y-1 pb-3 pt-4">
              <CardTitle className="text-base font-semibold">Productos destacados</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Aparecen en la sección «Destacados» de la tienda si al menos uno está activo.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 sm:px-6">
              {(productsQ.data ?? []).length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No hay productos.{' '}
                  <Link className="font-medium text-indigo-400 underline-offset-2 hover:underline" href="/dashboard/productos">
                    Crearlos en Productos
                  </Link>
                  .
                </p>
              ) : (
                <ul className="max-h-[min(60vh,28rem)] space-y-1.5 overflow-y-auto pr-1">
                  {(productsQ.data ?? []).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{p.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {p.visible === false ? 'Oculto en tienda' : 'Visible en tienda'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-zinc-500">Destacado</span>
                        <Switch
                          checked={!!p.featured}
                          disabled={toggleFeaturedMu.isPending}
                          onCheckedChange={(v) => toggleFeaturedMu.mutate({ id: p.id, featured: v })}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={editSlideOpen}
        onOpenChange={(open) => {
          if (!open && !updateSlideMu.isPending) closeEditSlide();
        }}
      >
        <DialogContent
          className="max-h-[min(90vh,36rem)] overflow-y-auto border-white/[0.08] bg-zinc-950 text-white sm:max-w-lg"
          onPointerDownOutside={(ev) => {
            if (updateSlideMu.isPending) ev.preventDefault();
          }}
          onEscapeKeyDown={(ev) => {
            if (updateSlideMu.isPending) ev.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Editar slide</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Imagen obligatoria; título, subtítulo y botón opcionales.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editSlideId) return;
              const url = editSlideImageUrl.trim();
              if (!url) return;
              updateSlideMu.mutate({
                id: editSlideId,
                imageUrl: url,
                title: editSlideTitle.trim() || null,
                subtitle: editSlideSubtitle.trim() || null,
                ctaLabel: editSlideCtaLabel.trim() || null,
                ctaHref: editSlideCtaHref.trim() || null,
              });
            }}
          >
            <ImageDropzone
              label="Imagen"
              bucket="carousel"
              buildPath={(file) => `${store.id}/slide-${Date.now()}${extensionFromFileName(file.name)}`}
              value={editSlideImageUrl}
              onChange={(u) => setEditSlideImageUrl(u || '')}
              required
              disabled={updateSlideMu.isPending}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-slide-title" className="text-xs">
                  Título
                </Label>
                <Input
                  id="edit-slide-title"
                  value={editSlideTitle}
                  onChange={(e) => setEditSlideTitle(e.target.value)}
                  disabled={updateSlideMu.isPending}
                  className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-slide-sub" className="text-xs">
                  Subtítulo
                </Label>
                <Input
                  id="edit-slide-sub"
                  value={editSlideSubtitle}
                  onChange={(e) => setEditSlideSubtitle(e.target.value)}
                  disabled={updateSlideMu.isPending}
                  className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                />
              </div>
            </div>
            <details className="group rounded-lg border border-zinc-800/80 bg-zinc-950/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200">
                <span className="mr-1 text-zinc-600 group-open:rotate-90">▸</span>
                Botón y enlace (opcional)
              </summary>
              <div className="grid gap-2 border-t border-zinc-800/60 px-3 py-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-slide-cta" className="text-xs">
                    Texto del botón
                  </Label>
                  <Input
                    id="edit-slide-cta"
                    value={editSlideCtaLabel}
                    onChange={(e) => setEditSlideCtaLabel(e.target.value)}
                    disabled={updateSlideMu.isPending}
                    className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-slide-href" className="text-xs">
                    URL del botón
                  </Label>
                  <Input
                    id="edit-slide-href"
                    value={editSlideCtaHref}
                    onChange={(e) => setEditSlideCtaHref(e.target.value)}
                    disabled={updateSlideMu.isPending}
                    className="h-9 border-zinc-800 bg-zinc-950 text-sm"
                    placeholder="https://…"
                  />
                </div>
              </div>
            </details>
            {updateSlideMu.error ? (
              <p className="text-sm text-rose-400">
                {updateSlideMu.error instanceof AxiosError
                  ? (() => {
                      const d = updateSlideMu.error.response?.data as { message?: string | string[] } | undefined;
                      if (Array.isArray(d?.message)) return d.message.join(', ');
                      if (typeof d?.message === 'string') return d.message;
                      return updateSlideMu.error.message;
                    })()
                  : updateSlideMu.error instanceof Error
                    ? updateSlideMu.error.message
                    : 'No se pudo guardar.'}
              </p>
            ) : null}
            <DialogFooter className="gap-2 pt-1 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-transparent"
                disabled={updateSlideMu.isPending}
                onClick={() => closeEditSlide()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-full shadow-none"
                disabled={updateSlideMu.isPending || !editSlideImageUrl.trim()}
              >
                {updateSlideMu.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
