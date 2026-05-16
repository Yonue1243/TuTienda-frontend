'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ProductDto } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import { StorefrontCartPanel } from '@/components/storefront/storefront-cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type StorefrontShopContextValue = {
  slug: string;
  onAddToCart: (p: ProductDto) => void;
  openCart: () => void;
};

const StorefrontShopContext = createContext<StorefrontShopContextValue | null>(null);

export function useStorefrontShop() {
  const ctx = useContext(StorefrontShopContext);
  if (!ctx) {
    throw new Error('useStorefrontShop debe usarse dentro de StorefrontShopShell');
  }
  return ctx;
}

export function StorefrontShopShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;

  const ensureShop = useCartStore((s) => s.ensureShop);
  useEffect(() => {
    ensureShop(slug);
  }, [slug, ensureShop]);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  const reduceMotion = useReducedMotion();

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

  const openCart = useCallback(() => setCartOpen(true), []);

  const ctxValue = useMemo(
    () => ({ slug, onAddToCart, openCart }),
    [slug, onAddToCart, openCart],
  );

  const total = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);
  const orderPending = orderMu.isPending;

  const cartProps = {
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
  };

  return (
    <StorefrontShopContext.Provider value={ctxValue}>
      {children}
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
    </StorefrontShopContext.Provider>
  );
}
