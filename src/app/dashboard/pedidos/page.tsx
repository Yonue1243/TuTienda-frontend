'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OrderDto } from '@/lib/types';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'] as const;

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

  if (orders.isLoading) {
    return <p className="text-sm text-zinc-400">Cargando pedidos…</p>;
  }

  if (orders.error) {
    return (
      <p className="text-sm text-amber-200">
        Creá tu tienda primero para ver pedidos.{' '}
        <a href="/dashboard/tienda" className="underline">
          Ir a Mi tienda
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Pedidos</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Actualizá el estado para ordenar tu operación diaria.
        </p>
      </div>

      <div className="space-y-4">
        {(orders.data ?? []).map((o) => (
          <div
            key={o.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{o.customerName}</p>
                <p className="text-xs text-zinc-400">{o.customerPhone}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(o.createdAt).toLocaleString('es-AR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-indigo-200">
                  ${Number(o.total).toFixed(2)}
                </p>
                <select
                  value={o.status}
                  onChange={(e) => patchMu.mutate({ id: o.id, status: e.target.value })}
                  className="mt-2 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {o.notes && (
              <p className="mt-3 rounded-xl bg-zinc-950/80 px-3 py-2 text-sm text-zinc-300">
                {o.notes}
              </p>
            )}
            <ul className="mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm text-zinc-300">
              {o.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-4">
                  <span>
                    {it.quantity} × {it.product.name}
                  </span>
                  <span className="text-zinc-500">${Number(it.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {(orders.data ?? []).length === 0 && (
          <p className="text-center text-sm text-zinc-500">No hay pedidos todavía.</p>
        )}
      </div>
    </div>
  );
}
