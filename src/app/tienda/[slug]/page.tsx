'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ProductDto, StorePublic, StoreSettingsDto } from '@/lib/types';
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
import { cn } from '@/lib/utils';

export default function PublicTiendaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;

  const ensureShop = useCartStore((s) => s.ensureShop);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  const reduceMotion = useReducedMotion();

  const onAddToCart = useCallback(
    (p: ProductDto) => {
      addItem({
        productId: p.id,
        name: p.name,
        unitPrice: Number(p.price),
        imageUrl: p.imageUrl,
        quantity: 1,
      });
      const label = p.name.length > 42 ? `${p.name.slice(0, 40)}…` : p.name;
      toast.success(`“${label}” agregado al carrito`);
      setCartBumpKey((k) => k + 1);
    },
    [addItem],
  );

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
      setCartOpen(false);
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
  const totalUnits = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);

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
      onRemoveLine: removeItem,
      onClearCart: clearCart,
      orderPending,
      orderMsg,
      orderErr,
      onSubmit: () => {
        setOrderMsg(null);
        setOrderErr(false);
        orderMu.mutate();
      },
    }),
    [
      items,
      total,
      customerName,
      customerPhone,
      notes,
      orderPending,
      orderMsg,
      orderErr,
      orderMu,
      setQty,
      removeItem,
      clearCart,
    ],
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

      <main className="mx-auto max-w-7xl px-4 pb-[max(6rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 md:pt-10 lg:px-8 lg:pb-28 lg:pt-12">
        <StorefrontPublicSections
          className="mx-0 max-w-none px-0 py-0"
          store={s}
          settings={settings}
          slides={slides}
          onAddToCart={onAddToCart}
        />
      </main>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'fixed z-40 flex size-14 items-center justify-center rounded-2xl shadow-lg ring-2 ring-black/10',
              'bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]',
              'motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.96]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sf-bg)]',
            )}
            style={{
              backgroundColor: 'var(--sf-btn)',
              color: 'var(--sf-btn-text)',
            }}
            aria-label={
              items.length > 0
                ? `Abrir carrito, ${totalUnits} artículos, total ${total.toFixed(2)} pesos`
                : 'Abrir carrito'
            }
          >
            <ShoppingBag className="size-6 shrink-0 opacity-95" aria-hidden />
            {totalUnits > 0 ? (
              reduceMotion ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[color:var(--sf-text)] px-1 text-[10px] font-bold tabular-nums leading-none text-[color:var(--sf-bg)] ring-2 ring-[color:var(--sf-btn)]">
                  {totalUnits > 99 ? '99+' : totalUnits}
                </span>
              ) : (
                <motion.span
                  key={cartBumpKey}
                  className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[color:var(--sf-text)] px-1 text-[10px] font-bold tabular-nums leading-none text-[color:var(--sf-bg)] ring-2 ring-[color:var(--sf-btn)]"
                  initial={{ scale: 0.88 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                >
                  {totalUnits > 99 ? '99+' : totalUnits}
                </motion.span>
              )
            ) : null}
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex h-full w-full max-w-md flex-col border-border bg-card p-0 text-card-foreground sm:max-w-sm"
        >
          <SheetHeader className="shrink-0 border-b border-border px-5 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-left">
            <SheetTitle className="font-semibold text-foreground">Tu pedido</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <StorefrontCartPanel
              {...cartProps}
              heading="Resumen"
              variant="drawer"
              onContinueShopping={() => setCartOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </StorefrontThemeShell>
  );
}
