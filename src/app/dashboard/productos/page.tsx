'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductDto, StorePublic } from '@/lib/types';
import { AxiosError } from 'axios';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { extensionFromFileName } from '@/lib/storage-upload';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardEmptyState } from '@/components/dashboard/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CategoryRow = { id: string; name: string };

export default function ProductosPage() {
  const qc = useQueryClient();

  const storeQ = useQuery({
    queryKey: ['store', 'me'],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>('/stores/me');
      return data;
    },
    retry: false,
  });

  const products = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<ProductDto[]>('/products');
      return data;
    },
    enabled: !!storeQ.data,
  });

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoryRow[]>('/categories');
      return data;
    },
    enabled: !!storeQ.data,
  });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eDescription, setEDescription] = useState('');
  const [eCategoryId, setECategoryId] = useState('');
  const [eStock, setEStock] = useState('');
  const [eImageUrl, setEImageUrl] = useState('');
  const [eVisible, setEVisible] = useState(true);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [editImageError, setEditImageError] = useState<string | null>(null);

  const createMu = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name,
        price: Number(price),
        description: description || undefined,
        visible: true,
        imageUrl: imageUrl.trim(),
      };
      if (categoryId) payload.categoryId = categoryId;
      if (stock !== '') payload.stock = Number(stock);
      const { data } = await api.post('/products', payload);
      return data;
    },
    onSuccess: async () => {
      setMsg('Producto creado.');
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setStock('');
      setImageUrl('');
      setImageError(null);
      await qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e: unknown) => {
      const ax = e as AxiosError<{ message?: string | string[] }>;
      const m = ax.response?.data?.message;
      setMsg(Array.isArray(m) ? m.join(', ') : m ?? 'Error al crear');
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMu = useMutation({
    mutationFn: async () => {
      if (!editId) throw new Error('Sin producto');
      const trimmedImg = eImageUrl.trim();
      if (!trimmedImg) {
        throw new Error('IMAGE_REQUIRED');
      }
      const desc = eDescription.trim();
      const payload: Record<string, unknown> = {
        name: eName.trim(),
        price: Number(ePrice),
        imageUrl: trimmedImg,
        visible: eVisible,
        description: desc === '' ? null : desc,
        categoryId: eCategoryId ? eCategoryId : null,
        stock: eStock === '' ? null : Number(eStock),
      };
      const { data } = await api.patch<ProductDto>(`/products/${editId}`, payload);
      return data;
    },
    onSuccess: async () => {
      setEditMsg(null);
      setEditImageError(null);
      await qc.invalidateQueries({ queryKey: ['products'] });
      closeEdit();
    },
    onError: (e: unknown) => {
      const ax = e as AxiosError<{ message?: string | string[] }>;
      if (e instanceof Error && e.message === 'IMAGE_REQUIRED') {
        setEditImageError('La imagen del producto es obligatoria.');
        setEditMsg(null);
        return;
      }
      const m = ax.response?.data?.message;
      setEditMsg(Array.isArray(m) ? m.join(', ') : m ?? 'Error al guardar');
    },
  });

  function openEdit(p: ProductDto) {
    setEditId(p.id);
    setEName(p.name);
    setEPrice(String(Number(p.price)));
    setEDescription(p.description ?? '');
    setECategoryId(p.categoryId ?? '');
    setEStock(p.stock != null ? String(p.stock) : '');
    setEImageUrl(p.imageUrl);
    setEVisible(p.visible);
    setEditMsg(null);
    setEditImageError(null);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditId(null);
    setEditMsg(null);
    setEditImageError(null);
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditMsg(null);
    setEditImageError(null);
    if (!eImageUrl.trim()) {
      setEditImageError('Subí o mantené una imagen del producto.');
      return;
    }
    updateMu.mutate();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setImageError(null);
    if (!imageUrl.trim()) {
      setImageError('Subí una imagen del producto antes de publicar.');
      return;
    }
    createMu.mutate();
  }

  const store = storeQ.data;
  const pending = createMu.isPending;
  const editPending = updateMu.isPending;

  if (storeQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <Skeleton className="h-9 w-56 bg-white/[0.06]" />
          <Skeleton className="h-4 w-full max-w-lg bg-white/[0.06]" />
        </div>
        <Skeleton className="h-96 rounded-xl bg-white/[0.06]" />
        <Skeleton className="h-64 rounded-xl bg-white/[0.06]" />
      </div>
    );
  }

  if (storeQ.error || !store) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <PageHeader title="Productos" description="Necesitás una tienda para gestionar el catálogo." />
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTitle>Crear tienda</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center">
            Primero creá tu tienda para cargar productos.
            <Button size="sm" className="w-fit rounded-full shadow-none" asChild>
              <Link href="/dashboard/tienda">Ir a Mi tienda</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const storeId = store.id;
  function buildProductPath(file: File) {
    return `product-images/${storeId}/${crypto.randomUUID()}${extensionFromFileName(file.name)}`;
  }

  const feedbackOk = msg === 'Producto creado.';

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      <PageHeader
        title="Productos"
        description="Cada producto necesita una imagen visible en tu tienda pública. Las fotos se guardan en Supabase Storage."
      />

      <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
        <CardHeader className="border-b border-white/[0.06] pb-5">
          <CardTitle className="text-lg font-semibold">Nuevo producto</CardTitle>
          <CardDescription>Completá los datos y subí la foto antes de guardar.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ImageDropzone
                label="Imagen del producto"
                bucket="product-images"
                buildPath={buildProductPath}
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  setImageError(null);
                }}
                disabled={pending}
                required
                hint="Obligatorio · JPG, PNG, WEBP o GIF · máx. 5 MB"
              />
              {imageError ? (
                <p className="mt-2 text-xs text-rose-400">{imageError}</p>
              ) : null}
            </div>

            <div className="space-y-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="p-name">Nombre</Label>
                <Input
                  id="p-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Café en grano 250 g"
                  className="border-white/[0.08] bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-price">Precio</Label>
                <Input
                  id="p-price"
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="border-white/[0.08] bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-cat">Categoría</Label>
                <select
                  id="p-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-white/[0.08] bg-zinc-950 px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sin categoría</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock">Stock (opcional)</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="—"
                  className="border-white/[0.08] bg-zinc-950"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="p-desc">Descripción</Label>
                <Textarea
                  id="p-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ingredientes, tamaño, tiempos de envío…"
                  className="border-white/[0.08] bg-zinc-950"
                />
              </div>
            </div>

            {msg ? (
              <Alert
                variant={feedbackOk ? 'default' : 'destructive'}
                className="lg:col-span-2 border-white/[0.08]"
              >
                <AlertTitle>{feedbackOk ? 'Listo' : 'No se pudo guardar'}</AlertTitle>
                <AlertDescription>{msg}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex justify-end lg:col-span-2">
              <Button type="submit" disabled={pending} className="rounded-full px-8 shadow-none">
                {pending ? 'Creando…' : 'Publicar producto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Tu catálogo</h2>
          <p className="text-sm text-zinc-500">
            {(products.data ?? []).length} producto
            {(products.data ?? []).length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {products.isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full bg-white/[0.06]" />
              ))}
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 sm:px-5">Producto</th>
                    <th className="px-4 py-3 sm:px-5">Precio</th>
                    <th className="hidden px-5 py-3 sm:table-cell">Stock</th>
                    <th className="hidden px-5 py-3 md:table-cell">Visible</th>
                    <th className="px-4 py-3 text-right sm:px-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {(products.data ?? []).map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{p.name}</p>
                            {p.category?.name ? (
                              <p className="text-xs text-zinc-500">{p.category.name}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 tabular-nums text-zinc-200 sm:px-5">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="hidden px-5 py-4 text-zinc-400 sm:table-cell">
                        {p.stock ?? '—'}
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        {p.visible ? (
                          <Badge variant="success">Visible</Badge>
                        ) : (
                          <Badge variant="outline">Oculto</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right sm:px-5">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="mr-1 size-3.5 opacity-80" aria-hidden />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            onClick={() => {
                              if (confirm('¿Eliminar este producto?')) {
                                deleteMu.mutate(p.id);
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(products.data ?? []).length === 0 ? (
                <DashboardEmptyState
                  icon={Package}
                  title="Catálogo vacío"
                  description="Creá tu primer producto con el formulario de arriba."
                />
              ) : null}
            </>
          )}
        </div>
      </section>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open && !editPending) closeEdit();
        }}
      >
        <DialogContent
          className="max-h-[min(90vh,720px)] overflow-y-auto border-white/[0.08] bg-zinc-950 text-white sm:max-w-xl"
          onPointerDownOutside={(ev) => {
            if (editPending) ev.preventDefault();
          }}
          onEscapeKeyDown={(ev) => {
            if (editPending) ev.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Editar producto</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Cambiá los datos y guardá. La imagen sigue siendo obligatoria en el catálogo público.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="grid gap-5 pt-1">
            <div>
              <ImageDropzone
                label="Imagen del producto"
                bucket="product-images"
                buildPath={buildProductPath}
                value={eImageUrl}
                onChange={(url) => {
                  setEImageUrl(url);
                  setEditImageError(null);
                }}
                disabled={editPending}
                required
                hint="Obligatorio · JPG, PNG, WEBP o GIF · máx. 5 MB"
              />
              {editImageError ? <p className="mt-2 text-xs text-rose-400">{editImageError}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="e-name">Nombre</Label>
                <Input
                  id="e-name"
                  required
                  value={eName}
                  onChange={(ev) => setEName(ev.target.value)}
                  className="border-white/[0.08] bg-zinc-900"
                  disabled={editPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-price">Precio</Label>
                <Input
                  id="e-price"
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={ePrice}
                  onChange={(ev) => setEPrice(ev.target.value)}
                  className="border-white/[0.08] bg-zinc-900"
                  disabled={editPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-cat">Categoría</Label>
                <select
                  id="e-cat"
                  value={eCategoryId}
                  onChange={(ev) => setECategoryId(ev.target.value)}
                  disabled={editPending}
                  className="flex h-9 w-full rounded-md border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sin categoría</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-stock">Stock (opcional)</Label>
                <Input
                  id="e-stock"
                  type="number"
                  min={0}
                  value={eStock}
                  onChange={(ev) => setEStock(ev.target.value)}
                  placeholder="Vacío = sin límite"
                  className="border-white/[0.08] bg-zinc-900"
                  disabled={editPending}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-zinc-900/50 px-3 py-2.5 sm:col-span-2">
                <div>
                  <Label htmlFor="e-visible" className="text-sm font-medium text-white">
                    Visible en la tienda
                  </Label>
                  <p className="text-xs text-zinc-500">Si está desactivado, no aparece en el catálogo público.</p>
                </div>
                <Switch id="e-visible" checked={eVisible} onCheckedChange={setEVisible} disabled={editPending} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="e-desc">Descripción</Label>
                <Textarea
                  id="e-desc"
                  value={eDescription}
                  onChange={(ev) => setEDescription(ev.target.value)}
                  rows={3}
                  className="border-white/[0.08] bg-zinc-900"
                  disabled={editPending}
                />
              </div>
            </div>

            {editMsg ? (
              <Alert variant="destructive" className="border-white/[0.08]">
                <AlertTitle>No se pudo guardar</AlertTitle>
                <AlertDescription>{editMsg}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" disabled={editPending} onClick={() => closeEdit()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editPending} className="shadow-none">
                {editPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
