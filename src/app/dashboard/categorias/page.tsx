'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { CategoryDto, StorePublic } from '@/lib/types';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardEmptyState } from '@/components/dashboard/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CategoriasPage() {
  const qc = useQueryClient();

  const storeQ = useQuery({
    queryKey: ['store', 'me'],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>('/stores/me');
      return data;
    },
    retry: false,
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoryDto[]>('/categories');
      return data;
    },
    enabled: !!storeQ.data,
  });

  const sorted = useMemo(() => {
    const list = categoriesQ.data ?? [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categoriesQ.data]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const reorderMu = useMutation({
    mutationFn: async (items: { id: string; sortOrder: number }[]) => {
      const { data } = await api.patch<CategoryDto[]>('/categories/reorder', { items });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] });
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
  });

  const saveMu = useMutation({
    mutationFn: async () => {
      const name = draftName.trim();
      if (!name) throw new Error('EMPTY');
      if (editingId) {
        const { data } = await api.patch<CategoryDto>(`/categories/${editingId}`, { name });
        return data;
      }
      const { data } = await api.post<CategoryDto>('/categories', { name });
      return data;
    },
    onSuccess: async () => {
      setFormError(null);
      await qc.invalidateQueries({ queryKey: ['categories'] });
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
      closeDialog();
    },
    onError: (e: unknown) => {
      if (e instanceof Error && e.message === 'EMPTY') {
        setFormError('El nombre no puede estar vacío.');
        return;
      }
      const ax = e as AxiosError<{ message?: string | string[] }>;
      const m = ax.response?.data?.message;
      setFormError(Array.isArray(m) ? m.join(', ') : m ?? 'No se pudo guardar');
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] });
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
      await qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  function openCreate() {
    setEditingId(null);
    setDraftName('');
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(c: CategoryDto) {
    setEditingId(c.id);
    setDraftName(c.name);
    setFormError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saveMu.isPending) return;
    setDialogOpen(false);
    setEditingId(null);
    setDraftName('');
    setFormError(null);
  }

  function moveRow(index: number, dir: -1 | 1) {
    const next = [...sorted];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const a = next[index];
    const b = next[j];
    next[index] = b;
    next[j] = a;
    reorderMu.mutate(next.map((c, i) => ({ id: c.id, sortOrder: i })));
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!draftName.trim()) {
      setFormError('El nombre no puede estar vacío.');
      return;
    }
    saveMu.mutate();
  }

  const pending = saveMu.isPending;

  if (storeQ.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-9 w-48 bg-white/[0.06]" />
        <Skeleton className="h-64 rounded-xl bg-white/[0.06]" />
      </div>
    );
  }

  if (storeQ.error || !storeQ.data) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <PageHeader title="Categorías" description="Necesitás una tienda para gestionar categorías." />
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTitle>Crear tienda</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center">
            Primero creá tu tienda.
            <Button size="sm" className="w-fit rounded-full shadow-none" asChild>
              <Link href="/dashboard/tienda">Ir a Mi tienda</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <PageHeader
        title="Categorías"
        description="Agrupá productos y definí el orden de las pestañas en el catálogo público. Los productos sin categoría siguen apareciendo en «Todos»."
        actions={
          <Button type="button" className="rounded-full shadow-none" onClick={openCreate}>
            <Plus className="mr-2 size-4" aria-hidden />
            Nueva categoría
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        {categoriesQ.isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-white/[0.06]" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <DashboardEmptyState
            icon={Tags}
            title="Sin categorías"
            description="Creá la primera con «Nueva categoría». Podés asignarlas a cada producto en Productos."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 sm:px-5">Nombre</th>
                <th className="hidden w-32 px-4 py-3 sm:table-cell">Orden</th>
                <th className="px-4 py-3 text-right sm:px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {sorted.map((c, index) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-medium text-white sm:px-5">{c.name}</td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        disabled={index === 0 || reorderMu.isPending}
                        onClick={() => moveRow(index, -1)}
                        aria-label="Subir en el orden"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        disabled={index === sorted.length - 1 || reorderMu.isPending}
                        onClick={() => moveRow(index, 1)}
                        aria-label="Bajar en el orden"
                      >
                        ↓
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right sm:px-5">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-zinc-300 hover:bg-white/[0.06] hover:text-white sm:hidden"
                        disabled={index === 0 || reorderMu.isPending}
                        onClick={() => moveRow(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-zinc-300 hover:bg-white/[0.06] hover:text-white sm:hidden"
                        disabled={index === sorted.length - 1 || reorderMu.isPending}
                        onClick={() => moveRow(index, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="mr-1 size-3.5 opacity-80" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        disabled={deleteMu.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `¿Eliminar la categoría «${c.name}»? Los productos asignados quedarán sin categoría.`,
                            )
                          ) {
                            deleteMu.mutate(c.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-1 size-3.5" aria-hidden />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        El orden de arriba a abajo coincide con las pestañas de izquierda a derecha en la tienda (después de «Todos»).
      </p>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !pending) closeDialog();
        }}
      >
        <DialogContent
          className="border-white/[0.08] bg-zinc-950 text-white sm:max-w-md"
          onPointerDownOutside={(ev) => {
            if (pending) ev.preventDefault();
          }}
          onEscapeKeyDown={(ev) => {
            if (pending) ev.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">{editingId ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Nombre visible en el panel y en las pestañas del catálogo público (máx. 120 caracteres).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={120}
                required
                disabled={pending}
                placeholder="Ej: Bebidas"
                className="border-white/[0.08] bg-zinc-900"
              />
            </div>
            {formError ? (
              <Alert variant="destructive" className="border-white/[0.08]">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" disabled={pending} onClick={() => closeDialog()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="shadow-none">
                {pending ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
