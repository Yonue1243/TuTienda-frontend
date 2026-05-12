'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import type { StorePublic, StoreSettingsDto } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import {
  StorefrontHero,
  StorefrontPublicSections,
  StorefrontThemeShell,
} from '@/components/storefront/storefront-public';
import { StorefrontCartPanel } from '@/components/storefront/storefront-cart';
import { mergeStoreSettings } from '@/components/storefront/storefront-theme';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { StorefrontPageSkeleton } from '@/components/storefront/storefront-page-skeleton';

export default function PublicTiendaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;

  const ensureShop = useCartStore((s) => s.ensureShop);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const clearCart = useCartStore((s) => s.clear);

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

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
      setMobileCartOpen(false);
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

  const orderPending = orderMu.isPending;
  const cartProps = useMemo(
    () => ({
      items,
      total,
      customerName,
      customerPhone,
      notes,
      onCustomerName: setCustomerName,
      onCustomerPhone: setCustomerPhone,
      onNotes: setNotes,
      onQty: setQty,
      orderPending,
      orderMsg,
      orderErr,
      onSubmit: () => {
        setOrderMsg(null);
        setOrderErr(false);
        orderMu.mutate();
      },
    }),
    [items, total, customerName, customerPhone, notes, orderPending, orderMsg, orderErr, orderMu, setQty],
  );

  if (store.isLoading) {
    return <StorefrontPageSkeleton />;
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
      <StorefrontHero store={s} settings={settings} />

      <main className="mx-auto grid max-w-6xl gap-10 px-4 pb-28 pt-8 sm:px-6 md:gap-12 md:pb-12 lg:grid-cols-[1fr_min(380px,34vw)] lg:gap-10 lg:px-6 lg:pb-12 lg:pt-10">
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

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)]/85 p-5 shadow-sm sm:p-6">
            <StorefrontCartPanel {...cartProps} />
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg)]/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--sf-bg)]/85 lg:hidden">
        <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] px-4 py-3 text-sm font-semibold text-[color:var(--sf-text)] shadow-sm motion-safe:active:scale-[0.99]"
            >
              <ShoppingBag className="size-4 shrink-0 opacity-90" aria-hidden />
              <span>Carrito</span>
              {items.length > 0 ? (
                <span className="tabular-nums text-[color:var(--sf-muted)]">
                  · {items.length} · ${total.toFixed(2)}
                </span>
              ) : (
                <span className="text-[color:var(--sf-muted)]">· vacío</span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[90vh] overflow-hidden rounded-t-3xl border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] p-0 text-[color:var(--sf-text)]"
          >
            <SheetHeader className="border-b border-[color:var(--sf-card-border)] px-6 pb-4 pt-6 text-left">
              <SheetTitle className="font-semibold text-[color:var(--sf-text)]">Tu pedido</SheetTitle>
            </SheetHeader>
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 pb-10 pt-4">
              <StorefrontCartPanel {...cartProps} heading="Resumen" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </StorefrontThemeShell>
  );
}
