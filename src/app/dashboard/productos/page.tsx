'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProductDto, StorePublic } from '@/lib/types';
import { AxiosError } from 'axios';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { extensionFromFileName } from '@/lib/storage-upload';

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

  if (storeQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-8 w-56 rounded-lg bg-zinc-800" />
        <div className="h-64 rounded-3xl bg-zinc-900/60 ring-1 ring-zinc-800" />
      </div>
    );
  }

  if (storeQ.error || !store) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-amber-500/25 bg-amber-500/10 p-8 text-center">
        <p className="text-sm text-amber-100">
          Primero creá tu tienda para cargar productos.
        </p>
        <Link
          href="/dashboard/tienda"
          className="mt-4 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Ir a Mi tienda
        </Link>
      </div>
    );
  }

  const storeId = store.id;
  function buildProductPath(file: File) {
    return `product-images/${storeId}/${crypto.randomUUID()}${extensionFromFileName(file.name)}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-300">
          Panel
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-300">Productos</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/90">Catálogo</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Productos</h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Cada producto necesita una imagen visible en tu tienda pública. Las fotos se guardan en
          Supabase Storage.
        </p>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/35 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8">
        <div className="mb-8 border-b border-zinc-800 pb-5">
          <h2 className="text-lg font-semibold text-white">Nuevo producto</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Completá los datos y subí la foto antes de guardar.
          </p>
        </div>

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
              <p className="mt-2 text-xs text-rose-300">{imageError}</p>
            ) : null}
          </div>

          <div className="space-y-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
            <div>
              <label className="text-xs font-medium text-zinc-400">Nombre</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Café en grano 250 g"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Precio</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-indigo-500/30 focus:border-indigo-500/40 focus:ring-2"
              >
                <option value="">Sin categoría</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Stock (opcional)</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="—"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ingredientes, tamaño, tiempos de envío…"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
          </div>

          {msg ? (
            <p className="lg:col-span-2 text-sm text-indigo-200">{msg}</p>
          ) : null}

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:opacity-60"
            >
              {pending ? 'Creando…' : 'Publicar producto'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Tu catálogo</h2>
            <p className="text-sm text-zinc-500">
              {(products.data ?? []).length} producto
              {(products.data ?? []).length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/40 shadow-inner shadow-black/20">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Precio</th>
                <th className="hidden px-5 py-4 sm:table-cell">Stock</th>
                <th className="hidden px-5 py-4 md:table-cell">Visible</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {products.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    Cargando…
                  </td>
                </tr>
              ) : (
                (products.data ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
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
                    <td className="px-5 py-4 tabular-nums text-zinc-200">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="hidden px-5 py-4 text-zinc-400 sm:table-cell">
                      {p.stock ?? '—'}
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.visible
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : 'bg-zinc-700/40 text-zinc-400'
                        }`}
                      >
                        {p.visible ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Eliminar este producto?')) {
                            deleteMu.mutate(p.id);
                          }
                        }}
                        className="text-xs font-medium text-rose-300 hover:text-rose-200"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!products.isLoading && (products.data ?? []).length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-zinc-500">
              Todavía no hay productos. Usá el formulario de arriba para el primero.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
