'use client';

import type { CSSProperties } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { CartLine } from '@/stores/cart-store';

const fieldStyle = {
  borderColor: 'var(--sf-card-border)',
  backgroundColor: 'var(--sf-bg)',
  color: 'var(--sf-text)',
  ['--tw-ring-color' as string]: 'var(--sf-primary)',
} as CSSProperties;

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
  orderPending: boolean;
  orderMsg: string | null;
  orderErr: boolean;
  onSubmit: () => void;
  heading?: string;
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
  orderPending,
  orderMsg,
  orderErr,
  onSubmit,
  heading = 'Carrito',
}: StorefrontCartPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="size-5 shrink-0 opacity-80" style={{ color: 'var(--sf-primary)' }} aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--sf-text)' }}>
          {heading}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-[color:var(--sf-muted)]">
          Agregá productos desde el catálogo. Tu resumen aparecerá acá.
        </p>
      ) : (
        <>
          <ul className="space-y-4 text-sm">
            {items.map((i) => (
              <li key={i.productId}>
                <div className="flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[color:var(--sf-card-border)] bg-black/10">
                    {i.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-[color:var(--sf-muted)]">
                        Sin img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium leading-snug" style={{ color: 'var(--sf-text)' }}>
                      {i.name}
                    </p>
                    <p className="text-xs tabular-nums text-[color:var(--sf-muted)]">
                      ${i.unitPrice.toFixed(2)} c/u
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => onQty(i.productId, Number(e.target.value))}
                    className="h-9 w-[4.25rem] shrink-0 rounded-lg border px-2 text-center text-xs tabular-nums"
                    style={fieldStyle}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Separator className="bg-[color:var(--sf-card-border)]" />

          <div
            className="flex items-center justify-between text-base font-semibold tabular-nums"
            style={{ color: 'var(--sf-text)' }}
          >
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Separator className="bg-[color:var(--sf-card-border)]" />

          <div className="space-y-3">
            <Input
              required
              placeholder="Tu nombre"
              value={customerName}
              onChange={(e) => onCustomerName(e.target.value)}
              className="rounded-xl border text-sm"
              style={fieldStyle}
            />
            <Input
              required
              placeholder="Teléfono"
              value={customerPhone}
              onChange={(e) => onCustomerPhone(e.target.value)}
              className="rounded-xl border text-sm"
              style={fieldStyle}
            />
            <Textarea
              placeholder="Notas para el comercio (opcional)"
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
              rows={3}
              className="resize-none rounded-xl border text-sm"
              style={fieldStyle}
            />
            <button
              type="button"
              disabled={orderPending}
              onClick={onSubmit}
              className="w-full rounded-full py-3.5 text-sm font-semibold shadow-none motion-safe:transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: 'var(--sf-btn)',
                color: 'var(--sf-btn-text)',
              }}
            >
              {orderPending ? 'Enviando…' : 'Enviar pedido'}
            </button>
            {orderMsg ? (
              <p
                role="status"
                className={`text-center text-sm leading-relaxed ${orderErr ? 'text-red-400/95' : 'text-emerald-400/95'}`}
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
