'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { StorePublic } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';

export default function PublicTiendaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;

  const ensureShop = useCartStore((s) => s.ensureShop);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    ensureShop(slug);
  }, [slug, ensureShop]);

  const store = useQuery({
    queryKey: ['store', 'public', slug],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>(`/stores/by-slug/${slug}`);
      return data;
    },
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [orderMsg, setOrderMsg] = useState<string | null>(null);

  const orderMu = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/orders', {
        storeSlug: slug,
        customerName,
        customerPhone,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      return data;
    },
    onSuccess: () => {
      setOrderMsg('¡Pedido enviado! El comercio lo verá en su panel.');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    },
    onError: () => {
      setOrderMsg('No pudimos enviar el pedido. Revisá stock y datos.');
    },
  });

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    [items],
  );

  if (store.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Cargando tienda…
      </div>
    );
  }

  if (store.error || !store.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <p className="text-lg text-white">Tienda no encontrada</p>
        <Link href="/" className="mt-4 text-indigo-300 hover:text-indigo-200">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const s = store.data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-8">
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-1 ring-zinc-800" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-lg font-bold text-indigo-200">
              {s.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{s.name}</h1>
            {s.description && <p className="mt-2 max-w-2xl text-sm text-zinc-400">{s.description}</p>}
            {s.phone ? (
              <p className="mt-3">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Contacto
                </span>
                <br />
                <a
                  href={`tel:${s.phone.replace(/\s/g, '')}`}
                  className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
                >
                  {s.phone}
                </a>
              </p>
            ) : null}
          </div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white">
            Powered by Tu Tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Catálogo
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {s.products.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40"
              >
                <div className="aspect-[4/3] bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 line-clamp-3 text-xs text-zinc-400">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-indigo-200">
                      ${Number(p.price).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          productId: p.id,
                          name: p.name,
                          unitPrice: Number(p.price),
                          imageUrl: p.imageUrl,
                          quantity: 1,
                        })
                      }
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-100"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {s.products.length === 0 && (
            <p className="mt-8 text-sm text-zinc-500">Esta tienda aún no publicó productos.</p>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 h-fit space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Carrito</h2>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">Agregá productos desde el catálogo.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-100">{i.name}</p>
                    <p className="text-xs text-zinc-500">${i.unitPrice.toFixed(2)} c/u</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQty(i.productId, Number(e.target.value))}
                    className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
                  />
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <>
              <div className="flex justify-between border-t border-zinc-800 pt-4 text-sm font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <input
                  required
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
                />
                <input
                  required
                  placeholder="Teléfono"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
                />
                <textarea
                  placeholder="Notas para el comercio (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
                />
                <button
                  type="button"
                  disabled={orderMu.isPending}
                  onClick={() => {
                    setOrderMsg(null);
                    orderMu.mutate();
                  }}
                  className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                >
                  {orderMu.isPending ? 'Enviando…' : 'Enviar pedido'}
                </button>
                {orderMsg && (
                  <p className="text-center text-xs text-emerald-300">{orderMsg}</p>
                )}
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
