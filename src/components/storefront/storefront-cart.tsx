'use client';

import { useEffect, useState } from 'react';
import { Minus, PackageOpen, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CartLine } from '@/stores/cart-store';

const MAX_QTY = 999;

export type StorefrontCartPanelProps = {
  items: CartLine[];
  total: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  onCustomerName: (v: string) => void;
  onCustomerPhone: (v: string) => void;
  onNotes: (v: string) => void;
  onQty: (productId: string, qty: number) => void;
  onRemoveLine: (productId: string) => void;
  onClearCart: () => void;
  orderPending: boolean;
  orderMsg: string | null;
  orderErr: boolean;
  onSubmit: () => void;
  heading?: string;
  /** embedded = aside desktop; drawer = dentro del Sheet móvil */
  variant?: 'embedded' | 'drawer';
  /** CTA vacío: p. ej. cerrar el sheet */
  onContinueShopping?: () => void;
};

export function StorefrontCartPanel({
  items,
  total,
  customerName,
  customerPhone,
  notes,
  onCustomerName,
  onCustomerPhone,
  onNotes,
  onQty,
  onRemoveLine,
  onClearCart,
  orderPending,
  orderMsg,
  orderErr,
  onSubmit,
  heading = 'Carrito',
  variant = 'embedded',
  onContinueShopping,
}: StorefrontCartPanelProps) {
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    if (items.length === 0) setClearConfirm(false);
  }, [items.length]);

  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);
  const isDrawer = variant === 'drawer';

  return (
    <div
      className={cn(
        'text-card-foreground',
        isDrawer ? 'space-y-5' : 'space-y-6',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--sf-primary-soft)] text-[color:var(--sf-primary)] ring-1 ring-[color:var(--sf-card-border)]">
          <ShoppingBag className="size-4" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{heading}</h2>
      </div>

      {items.length === 0 ? (
        <div
          className={cn(
            'flex flex-col items-center rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-bg-accent)]/50 px-6 py-12 text-center',
          )}
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border">
            <PackageOpen className="size-8 stroke-[1.25]" aria-hidden />
          </div>
          <p className="text-base font-semibold tracking-tight text-foreground">Tu carrito está vacío</p>
          <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
            Agregá productos desde el catálogo. Cuando elijas algo, vas a verlo acá al instante.
          </p>
          {onContinueShopping ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-6 rounded-full px-6"
              onClick={onContinueShopping}
            >
              Seguir comprando
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((i) => {
              const lineTotal = i.unitPrice * i.quantity;
              const atMin = i.quantity <= 1;
              const atMax = i.quantity >= MAX_QTY;
              return (
                <li
                  key={i.productId}
                  className={cn(
                    'rounded-2xl border border-[color:var(--sf-card-border)] bg-[color:var(--sf-surface)] p-3 shadow-[var(--sf-shadow-sm)]',
                    'motion-safe:transition-[box-shadow,transform] motion-safe:duration-200 hover:shadow-[var(--sf-shadow-md)]',
                  )}
                >
                  <div className="flex gap-3">
                    <div className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/50">
                      {i.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={i.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium leading-snug text-foreground line-clamp-2">{i.name}</p>
                          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                            ${i.unitPrice.toFixed(2)} c/u
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveLine(i.productId)}
                          aria-label={`Eliminar ${i.name} del carrito`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full border border-border bg-background/80 p-0.5 shadow-inner">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            disabled={atMin}
                            onClick={() => onQty(i.productId, i.quantity - 1)}
                            aria-label={`Menos ${i.name}`}
                          >
                            <Minus className="size-4" aria-hidden />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-foreground">
                            {i.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            disabled={atMax}
                            onClick={() => onQty(i.productId, i.quantity + 1)}
                            aria-label={`Más ${i.name}`}
                          >
                            <Plus className="size-4" aria-hidden />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          ${lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-2">
            {clearConfirm ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">¿Vaciar todo?</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => {
                    onClearCart();
                    setClearConfirm(false);
                  }}
                >
                  Sí, vaciar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => setClearConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 -ml-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setClearConfirm(true)}
              >
                Vaciar carrito
              </Button>
            )}
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between tabular-nums text-muted-foreground">
              <span>Artículos</span>
              <span>{totalUnits}</span>
            </div>
            <div className="flex justify-between tabular-nums text-muted-foreground">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold tabular-nums text-foreground">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Datos del pedido</p>
            <Input
              required
              placeholder="Tu nombre"
              value={customerName}
              onChange={(e) => onCustomerName(e.target.value)}
              className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Input
              required
              placeholder="Teléfono"
              value={customerPhone}
              onChange={(e) => onCustomerPhone(e.target.value)}
              className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Textarea
              placeholder="Notas para el comercio (opcional)"
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
              rows={3}
              className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              disabled={orderPending}
              onClick={onSubmit}
              className="h-12 w-full rounded-full border-0 text-sm font-semibold shadow-[var(--sf-shadow-sm)] motion-safe:transition-transform motion-safe:active:scale-[0.99]"
              style={{ backgroundColor: 'var(--sf-btn)', color: 'var(--sf-btn-text)' }}
            >
              {orderPending ? 'Enviando…' : 'Enviar pedido'}
            </Button>
            {orderMsg ? (
              <p
                role="status"
                className={cn(
                  'text-center text-sm leading-relaxed',
                  orderErr ? 'text-destructive' : 'text-emerald-500',
                )}
              >
                {orderMsg}
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
