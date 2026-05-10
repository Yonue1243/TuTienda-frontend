'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { StorePublic, StoreSettingsDto } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import {
  StorefrontPublicHeader,
  StorefrontPublicSections,
  StorefrontThemeShell,
} from '@/components/storefront/storefront-public';
import { mergeStoreSettings } from '@/components/storefront/storefront-theme';

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
  const [orderErr, setOrderErr] = useState(false);

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
      setOrderErr(false);
      setOrderMsg('¡Pedido enviado! El comercio lo verá en su panel.');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    },
    onError: () => {
      setOrderErr(true);
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
  const settings: StoreSettingsDto = mergeStoreSettings(s.settings);
  const slides = [...(s.carouselSlides ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <StorefrontThemeShell settings={s.settings}>
      <StorefrontPublicHeader store={s} settings={settings} />

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <StorefrontPublicSections
          className="mx-0 max-w-none px-0 py-0"
          store={s}
          settings={settings}
          slides={slides}
          onAddToCart={(p) =>
            addItem({
              productId: p.id,
              name: p.name,
              unitPrice: Number(p.price),
              imageUrl: p.imageUrl,
              quantity: 1,
            })
          }
        />

        <aside className="lg:sticky lg:top-24 h-fit space-y-6 rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)]/80 p-5 sm:p-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--sf-text)' }}>
            Carrito
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-[color:var(--sf-muted)]">
              Agregá productos desde el catálogo.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--sf-text)' }}>
                      {i.name}
                    </p>
                    <p className="text-xs text-[color:var(--sf-muted)]">
                      ${i.unitPrice.toFixed(2)} c/u
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQty(i.productId, Number(e.target.value))}
                    className="w-16 rounded-lg border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)] px-2 py-1 text-xs"
                    style={{ color: 'var(--sf-text)' }}
                  />
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <>
              <div
                className="flex justify-between border-t pt-4 text-sm font-semibold"
                style={{
                  borderColor: 'var(--sf-card-border)',
                  color: 'var(--sf-text)',
                }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div
                className="space-y-3 border-t pt-4"
                style={{ borderColor: 'var(--sf-card-border)' }}
              >
                <input
                  required
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2"
                  style={
                    {
                      borderColor: 'var(--sf-card-border)',
                      backgroundColor: 'var(--sf-bg)',
                      color: 'var(--sf-text)',
                      ['--tw-ring-color' as string]: 'var(--sf-primary)',
                    } as CSSProperties
                  }
                />
                <input
                  required
                  placeholder="Teléfono"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2"
                  style={
                    {
                      borderColor: 'var(--sf-card-border)',
                      backgroundColor: 'var(--sf-bg)',
                      color: 'var(--sf-text)',
                      ['--tw-ring-color' as string]: 'var(--sf-primary)',
                    } as CSSProperties
                  }
                />
                <textarea
                  placeholder="Notas para el comercio (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2"
                  style={
                    {
                      borderColor: 'var(--sf-card-border)',
                      backgroundColor: 'var(--sf-bg)',
                      color: 'var(--sf-text)',
                      ['--tw-ring-color' as string]: 'var(--sf-primary)',
                    } as CSSProperties
                  }
                />
                <button
                  type="button"
                  disabled={orderMu.isPending}
                  onClick={() => {
                    setOrderMsg(null);
                    setOrderErr(false);
                    orderMu.mutate();
                  }}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition hover:opacity-95 disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--sf-btn)',
                    color: 'var(--sf-btn-text)',
                  }}
                >
                  {orderMu.isPending ? 'Enviando…' : 'Enviar pedido'}
                </button>
                {orderMsg ? (
                  <p
                    className={`text-center text-xs leading-relaxed ${
                      orderErr ? 'text-red-400/95' : 'text-emerald-400/95'
                    }`}
                  >
                    {orderMsg}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </aside>
      </main>
    </StorefrontThemeShell>
  );
}
