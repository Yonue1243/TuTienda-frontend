'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '@/lib/api';
import type {
  CarouselSlideDto,
  CategoryDto,
  ProductDto,
  StorePublic,
  StoreSettingsDto,
} from '@/lib/types';
import { extensionFromFileName } from '@/lib/storage-upload';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { HexColorInput } from '@/components/dashboard/hex-color-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  StorefrontPublicHeader,
  StorefrontPublicSections,
  StorefrontThemeShell,
} from '@/components/storefront/storefront-public';
import { mergeStoreSettings } from '@/components/storefront/storefront-theme';

export default function AparienciaPage() {
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

  const notFound =
    storeQ.error instanceof AxiosError && storeQ.error.response?.status === 404;

  const baseSettings = storeQ.data?.settings ?? null;
  const [draft, setDraft] = useState<Partial<StoreSettingsDto>>({});

  const settingsSyncKey = storeQ.data?.settings
    ? `${storeQ.data.settings.id}:${storeQ.data.settings.updatedAt}`
    : null;

  useEffect(() => {
    if (!settingsSyncKey) return;
    setDraft({});
  }, [settingsSyncKey]);

  const effective = mergeStoreSettings(baseSettings, draft);

  const previewStore: StorePublic | null = useMemo(() => {
    if (!storeQ.data) return null;
    const visibleProducts = (storeQ.data.products ?? []).filter((p) => p.visible !== false);
    return {
      ...storeQ.data,
      products: visibleProducts,
    };
  }, [storeQ.data]);

  const sortedSlides = useMemo(
    () =>
      [...(storeQ.data?.carouselSlides ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [storeQ.data?.carouselSlides],
  );

  const patchSettingsMu = useMutation({
    mutationFn: async (body: Partial<StoreSettingsDto>) => {
      const { data } = await api.patch<StoreSettingsDto>('/stores/me/settings', body);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

  const reorderCategoriesMu = useMutation({
    mutationFn: async (items: { id: string; sortOrder: number }[]) => {
      const { data } = await api.patch<CategoryDto[]>('/categories/reorder', { items });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

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

  function patchDraft<K extends keyof StoreSettingsDto>(key: K, value: StoreSettingsDto[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function saveVisualSettings() {
    if (!baseSettings) return;
    const payload = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => v !== undefined),
    ) as Partial<StoreSettingsDto>;
    if (Object.keys(payload).length === 0) return;
    patchSettingsMu.mutate(payload);
  }

  function revertDraft() {
    setDraft({});
  }

  const dirty = Object.keys(draft).length > 0;

  const sortedCategories = useMemo(() => {
    const cats = storeQ.data?.categories ?? [];
    return [...cats].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [storeQ.data?.categories]);

  function moveCategory(index: number, dir: -1 | 1) {
    const next = [...sortedCategories];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const a = next[index];
    const b = next[j];
    next[index] = b;
    next[j] = a;
    reorderCategoriesMu.mutate(next.map((c, i) => ({ id: c.id, sortOrder: i })));
  }

  if (storeQ.isLoading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
        Cargando…
      </div>
    );
  }

  if (notFound || !storeQ.data || !previewStore || !baseSettings) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader>
          <CardTitle className="text-white">Creá tu tienda primero</CardTitle>
          <CardDescription>
            La personalización visual está disponible una vez que tengas una tienda activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/dashboard/tienda">Ir a Mi tienda</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const store = storeQ.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Apariencia</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Colores, banner, carrusel y secciones de tu tienda pública. Vista previa en vivo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={!dirty} onClick={() => revertDraft()}>
            Deshacer cambios
          </Button>
          <Button
            type="button"
            disabled={!dirty || patchSettingsMu.isPending}
            onClick={() => saveVisualSettings()}
          >
            {patchSettingsMu.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <Tabs defaultValue="colores" className="w-full">
            <TabsList className="flex w-full flex-wrap gap-1 bg-zinc-900">
              <TabsTrigger value="colores">Colores</TabsTrigger>
              <TabsTrigger value="banner">Banner</TabsTrigger>
              <TabsTrigger value="carrusel">Carrusel</TabsTrigger>
              <TabsTrigger value="secciones">Secciones</TabsTrigger>
              <TabsTrigger value="destacados">Destacados</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="colores" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Paleta</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Página, encabezado y tarjetas tienen fondos independientes. Vista previa al instante;
                    pulsá Guardar para persistir.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <HexColorInput
                    label="Primario"
                    value={draft.primaryColor ?? baseSettings.primaryColor}
                    onChange={(v) => patchDraft('primaryColor', v)}
                  />
                  <HexColorInput
                    label="Secundario"
                    value={draft.secondaryColor ?? baseSettings.secondaryColor}
                    onChange={(v) => patchDraft('secondaryColor', v)}
                  />
                  <HexColorInput
                    label="Fondo (página)"
                    value={draft.backgroundColor ?? baseSettings.backgroundColor}
                    onChange={(v) => patchDraft('backgroundColor', v)}
                  />
                  <HexColorInput
                    label="Fondo del encabezado"
                    value={
                      draft.headerBackgroundColor ??
                      baseSettings.headerBackgroundColor ??
                      baseSettings.backgroundColor
                    }
                    onChange={(v) => patchDraft('headerBackgroundColor', v)}
                  />
                  <HexColorInput
                    label="Fondo de tarjetas (productos)"
                    value={
                      draft.productCardBackgroundColor ??
                      baseSettings.productCardBackgroundColor ??
                      '#18181b'
                    }
                    onChange={(v) => patchDraft('productCardBackgroundColor', v)}
                  />
                  <HexColorInput
                    label="Texto"
                    value={draft.textColor ?? baseSettings.textColor}
                    onChange={(v) => patchDraft('textColor', v)}
                  />
                  <HexColorInput
                    label="Botón"
                    value={draft.buttonColor ?? baseSettings.buttonColor}
                    onChange={(v) => patchDraft('buttonColor', v)}
                  />
                  <HexColorInput
                    label="Texto del botón"
                    value={draft.buttonTextColor ?? baseSettings.buttonTextColor}
                    onChange={(v) => patchDraft('buttonTextColor', v)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banner" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Banner superior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="show-banner">Mostrar banner</Label>
                      <p className="text-xs text-zinc-500">Imagen ancha debajo del encabezado.</p>
                    </div>
                    <Switch
                      id="show-banner"
                      checked={draft.showBanner ?? baseSettings.showBanner}
                      onCheckedChange={(v) => patchDraft('showBanner', v)}
                    />
                  </div>
                  <ImageDropzone
                    label="Imagen del banner"
                    bucket="banners"
                    buildPath={(file) => `${store.id}/banner-${Date.now()}${extensionFromFileName(file.name)}`}
                    value={draft.bannerUrl ?? baseSettings.bannerUrl ?? ''}
                    onChange={(url) =>
                      patchDraft('bannerUrl', url?.trim() ? url.trim() : null)
                    }
                    hint="Recomendado formato panorámico."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carrusel" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Slides</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Activá el carrusel en la pestaña Secciones. Cada slide necesita imagen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="carousel-enabled-preview">Carrusel habilitado</Label>
                      <p className="text-xs text-zinc-500">Requiere al menos un slide.</p>
                    </div>
                    <Switch
                      id="carousel-enabled-preview"
                      checked={draft.carouselEnabled ?? baseSettings.carouselEnabled}
                      onCheckedChange={(v) => patchDraft('carouselEnabled', v)}
                    />
                  </div>

                  <div className="space-y-3 border-t border-zinc-800 pt-4">
                    <p className="text-sm font-medium text-white">Slides actuales</p>
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

                  <div className="space-y-3 border-t border-zinc-800 pt-4">
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
                      disabled={
                        createSlideMu.isPending || !slideImageUrl || slideImageUrl.trim() === ''
                      }
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
            </TabsContent>

            <TabsContent value="secciones" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Visibilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Carrusel</Label>
                      <p className="text-xs text-zinc-500">Mostrar slides en la home.</p>
                    </div>
                    <Switch
                      checked={draft.carouselEnabled ?? baseSettings.carouselEnabled}
                      onCheckedChange={(v) => patchDraft('carouselEnabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Sección categorías</Label>
                      <p className="text-xs text-zinc-500">Pestañas por categoría.</p>
                    </div>
                    <Switch
                      checked={draft.categoriesSectionEnabled ?? baseSettings.categoriesSectionEnabled}
                      onCheckedChange={(v) => patchDraft('categoriesSectionEnabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Destacados</Label>
                      <p className="text-xs text-zinc-500">Productos marcados como destacados.</p>
                    </div>
                    <Switch
                      checked={draft.featuredSectionEnabled ?? baseSettings.featuredSectionEnabled}
                      onCheckedChange={(v) => patchDraft('featuredSectionEnabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Descripción</Label>
                      <p className="text-xs text-zinc-500">Texto de presentación de la tienda.</p>
                    </div>
                    <Switch
                      checked={
                        draft.descriptionSectionEnabled ?? baseSettings.descriptionSectionEnabled
                      }
                      onCheckedChange={(v) => patchDraft('descriptionSectionEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Orden de categorías</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Afecta pestañas y recorridos en la tienda pública.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sortedCategories.map((c, index) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200"
                    >
                      <span className="truncate">{c.name}</span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={index === 0 || reorderCategoriesMu.isPending}
                          onClick={() => moveCategory(index, -1)}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            index === sortedCategories.length - 1 || reorderCategoriesMu.isPending
                          }
                          onClick={() => moveCategory(index, 1)}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sortedCategories.length === 0 ? (
                    <p className="text-sm text-zinc-500">No hay categorías.</p>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="destacados" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Productos destacados</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Aparecen primero si la sección está activa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                            onCheckedChange={(v) =>
                              toggleFeaturedMu.mutate({ id: p.id, featured: v })
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/60">
                <CardHeader>
                  <CardTitle className="text-base text-white">Estilo de catálogo</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="layout-style">Disposición</Label>
                    <select
                      id="layout-style"
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white"
                      value={draft.layoutStyle ?? baseSettings.layoutStyle}
                      onChange={(e) =>
                        patchDraft('layoutStyle', e.target.value as StoreSettingsDto['layoutStyle'])
                      }
                    >
                      <option value="grid">Grilla</option>
                      <option value="list">Lista</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-style">Tarjetas</Label>
                    <select
                      id="card-style"
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white"
                      value={draft.cardStyle ?? baseSettings.cardStyle}
                      onChange={(e) =>
                        patchDraft('cardStyle', e.target.value as StoreSettingsDto['cardStyle'])
                      }
                    >
                      <option value="rounded">Con relieve</option>
                      <option value="flat">Plano</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="corner-radius">Radio de esquinas</Label>
                    <select
                      id="corner-radius"
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white"
                      value={draft.cornerRadius ?? baseSettings.cornerRadius}
                      onChange={(e) =>
                        patchDraft(
                          'cornerRadius',
                          e.target.value as StoreSettingsDto['cornerRadius'],
                        )
                      }
                    >
                      <option value="sm">Chico</option>
                      <option value="md">Medio</option>
                      <option value="lg">Grande</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-6rem)]">
          <Card className="flex h-full flex-col overflow-hidden border-zinc-800 bg-zinc-950/60">
            <CardHeader className="shrink-0 pb-2">
              <CardTitle className="text-base text-white">Vista previa</CardTitle>
              <CardDescription className="text-zinc-500">
                Así se ve tu tienda con los valores actuales (incluye cambios sin guardar).
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-800 bg-black/40 p-0">
              <StorefrontThemeShell settings={baseSettings} draft={draft}>
                <StorefrontPublicHeader store={previewStore} settings={effective} />
                <StorefrontPublicSections
                  store={previewStore}
                  settings={effective}
                  slides={sortedSlides}
                />
              </StorefrontThemeShell>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
