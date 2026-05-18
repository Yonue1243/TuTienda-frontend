'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';
import type { OrderDto } from '@/lib/types';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardEmptyState } from '@/components/dashboard/empty-state';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'] as const;

const statusLabel: Record<(typeof statuses)[number], string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  CANCELLED: 'Cancelado',
};

function StatusBadge({ status }: { status: string }) {
  const s = status as (typeof statuses)[number];
  const variant =
    s === 'CANCELLED'
      ? 'destructive'
      : s === 'SHIPPED'
        ? 'success'
        : s === 'CONFIRMED'
          ? 'secondary'
          : 'outline';
  return <Badge variant={variant}>{statusLabel[s] ?? status}</Badge>;
}

export default function PedidosPage() {
  const qc = useQueryClient();
  const orders = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<OrderDto[]>('/orders');
      return data;
    },
  });

  const patchMu = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <PageHeader
        title="Pedidos"
        description="Actualizá el estado para ordenar tu operación diaria."
      />

      {orders.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      ) : null}

      {orders.error ? (
        <Alert variant="destructive" className="border-white/[0.1] bg-rose-500/10">
          <AlertTitle>Crear tienda primero</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            Necesitás una tienda activa para ver pedidos.
            <Link href="/dashboard/tienda" className="font-medium underline underline-offset-2">
              Ir a Mi tienda
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {!orders.isLoading && !orders.error ? (
        <>
          {(orders.data ?? []).length === 0 ? (
            <DashboardEmptyState
              icon={ClipboardList}
              title="No hay pedidos todavía"
              description="Cuando tus clientes envíen pedidos desde la tienda pública, aparecerán acá."
            />
          ) : (
            <div className="space-y-4">
              {(orders.data ?? []).map((o) => (
                <Card key={o.id} className="overflow-hidden border-white/[0.06] bg-white/[0.02] shadow-none">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{o.customerName}</p>
                        <p className="text-sm text-zinc-400">{o.customerPhone}</p>
                        <p className="text-[12px] text-zinc-500">
                          {new Date(o.createdAt).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-lg font-semibold tabular-nums text-white">
                          ${Number(o.total).toFixed(2)}
                        </p>
                        <StatusBadge status={o.status} />
                        <select
                          value={o.status}
                          onChange={(e) => patchMu.mutate({ id: o.id, status: e.target.value })}
                          className="rounded-lg border border-white/[0.1] bg-zinc-950 px-2 py-1.5 text-[12px] text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Cambiar estado del pedido"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {o.notes ? (
                      <p className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-sm text-zinc-300">
                        {o.notes}
                      </p>
                    ) : null}
                    <Separator className="bg-white/[0.06]" />
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {o.items.map((it) => (
                        <li key={it.id} className="flex justify-between gap-4">
                          <span>
                            {it.quantity} × {it.product.name}
                          </span>
                          <span className="tabular-nums text-zinc-500">${Number(it.price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
