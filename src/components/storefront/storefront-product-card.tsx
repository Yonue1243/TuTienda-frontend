'use client';

import { Minus, Plus } from 'lucide-react';
import type { ProductDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { storefrontRadiusClass } from './storefront-theme';

const r = storefrontRadiusClass();

type Props = {
  product: ProductDto;
  variant?: 'slider' | 'grid';
  onAdd?: () => void;
  className?: string;
};

export function StorefrontProductCard({ product, variant = 'grid', onAdd, className }: Props) {
  const qty = useCartStore((s) => {
    const line = s.items.find((i) => i.productId === product.id);
    return line?.quantity ?? 0;
  });
  const setQty = useCartStore((s) => s.setQty);

  const outOfStock = product.stock === 0;
  const maxStock = product.stock;
  const atMaxStock = maxStock != null && qty >= maxStock;
  const isSlider = variant === 'slider';

  const handleFirstAdd = () => {
    if (outOfStock || !onAdd) return;
    onAdd();
  };

  const handlePlus = () => {
    if (outOfStock || atMaxStock) return;
    if (qty === 0) {
      handleFirstAdd();
      return;
    }
    setQty(product.id, qty + 1);
  };

  const handleMinus = () => {
    if (qty < 1) return;
    setQty(product.id, qty - 1);
  };

  const showAddZone = Boolean(onAdd) || outOfStock;

  return (
    <article
      className={cn(
        `flex h-full flex-col overflow-hidden border ${r} border-[color:var(--sf-card-border)] bg-[color:var(--sf-surface)] shadow-[var(--sf-shadow-sm)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-200 motion-safe:ease-out`,
        'hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-md)]',
        isSlider && 'w-full',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        {product.featured ? (
          <div className="absolute left-2 top-2">
            <span
              className={`inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${r}`}
            >
              Destacado
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5 sm:p-4">
        <div className="space-y-1">
          <h3
            className={cn(
              'font-semibold leading-snug tracking-tight text-[color:var(--sf-text)]',
              'text-sm sm:text-[15px]',
            )}
          >
            {product.name}
          </h3>
          {product.description ? (
            <p
              className={cn(
                'text-[color:var(--sf-muted)]',
                'line-clamp-2 text-sm leading-relaxed',
              )}
            >
              {product.description}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex items-end justify-between gap-2 border-t border-[color:var(--sf-card-border)]/80',
            'pt-3',
          )}
        >
          <p
            className={cn(
              'font-semibold tabular-nums text-[color:var(--sf-primary)]',
              'text-base sm:text-lg',
            )}
          >
            ${Number(product.price).toFixed(2)}
          </p>
          {showAddZone ? (
            outOfStock ? (
              <Button
                type="button"
                size="sm"
                disabled
                className={cn(
                  'cursor-not-allowed rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] px-2.5 text-[10px] font-semibold text-[color:var(--sf-muted)] opacity-90',
                  r,
                )}
              >
                Sin stock
              </Button>
            ) : qty >= 1 ? (
              <div
                className={cn(
                  'inline-flex h-8 items-stretch overflow-hidden rounded-full border border-[color:var(--sf-card-border)] bg-[color:var(--sf-product-card-bg)] text-[color:var(--sf-text)] shadow-sm ring-1 ring-black/[0.04]',
                  r,
                )}
                role="group"
                aria-label={`Cantidad de ${product.name} en el carrito`}
              >
                <button
                  type="button"
                  onClick={handleMinus}
                  className="flex w-8 shrink-0 items-center justify-center hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--sf-primary)]"
                  aria-label="Quitar una unidad"
                >
                  <Minus className="size-3.5" aria-hidden strokeWidth={2.25} />
                </button>
                <span className="flex min-w-[1.5rem] items-center justify-center border-x border-[color:var(--sf-card-border)]/80 px-0.5 text-[11px] font-bold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  disabled={atMaxStock}
                  className={cn(
                    'flex w-8 shrink-0 items-center justify-center hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--sf-primary)]',
                    atMaxStock && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                  )}
                  aria-label="Agregar una unidad"
                >
                  <Plus className="size-3.5" aria-hidden strokeWidth={2.25} />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleFirstAdd}
                className={cn(
                  'gap-1 rounded-full border-0 px-3 text-[11px] font-semibold shadow-sm motion-safe:active:scale-[0.97]',
                  'min-w-[5.5rem] px-4 text-xs',
                  r,
                )}
                style={{
                  backgroundColor: 'var(--sf-btn)',
                  color: 'var(--sf-btn-text)',
                }}
              >
                <Plus className="size-3.5 shrink-0" aria-hidden />
                Agregar
              </Button>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
