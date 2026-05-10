'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StorePublic } from '@/lib/types';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { PhoneField } from '@/components/forms/PhoneField';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { extensionFromFileName } from '@/lib/storage-upload';

export default function TiendaSettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const q = useQuery({
    queryKey: ['store', 'me'],
    queryFn: async () => {
      const { data } = await api.get<StorePublic>('/stores/me');
      return data;
    },
    retry: false,
  });

  const notFound =
    q.error instanceof AxiosError && q.error.response?.status === 404;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [logoUrl, setLogoUrl] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (q.data) {
      setName(q.data.name);
      setSlug(q.data.slug);
      setDescription(q.data.description ?? '');
      setPhone(q.data.phone ?? undefined);
      setLogoUrl(q.data.logoUrl ?? '');
    }
  }, [q.data]);

  const createMu = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/stores', {
        name,
        slug,
        description,
        phone,
        logoUrl: logoUrl || undefined,
      });
      return data;
    },
    onSuccess: async () => {
      setMsg('Tienda creada correctamente.');
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
    onError: (e: unknown) => {
      const ax = e as AxiosError<{ message?: string | string[] }>;
      const m = ax.response?.data?.message;
      setMsg(Array.isArray(m) ? m.join(', ') : m ?? 'No se pudo crear');
    },
  });

  const updateMu = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/stores/me', {
        name,
        slug,
        description,
        phone,
        logoUrl: logoUrl || undefined,
      });
      return data;
    },
    onSuccess: async () => {
      setMsg('Cambios guardados.');
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
    onError: (e: unknown) => {
      const ax = e as AxiosError<{ message?: string | string[] }>;
      const m = ax.response?.data?.message;
      setMsg(Array.isArray(m) ? m.join(', ') : m ?? 'No se pudo guardar');
    },
  });

  const exists = !!q.data;

  const logoPathBuilder = useMemo(() => {
    return (file: File) =>
      `logos/${user?.id ?? 'user'}/${crypto.randomUUID()}${extensionFromFileName(file.name)}`;
  }, [user?.id]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setPhoneError(null);

    if (!phone || phone.length < 10) {
      setPhoneError('Ingresá un teléfono de contacto válido.');
      return;
    }

    if (exists) {
      updateMu.mutate();
    } else {
      createMu.mutate();
    }
  }

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-zinc-800" />
        <div className="h-4 w-full max-w-lg rounded bg-zinc-800" />
        <div className="h-72 rounded-3xl bg-zinc-900/60 ring-1 ring-zinc-800" />
      </div>
    );
  }

  if (q.isError && !notFound) {
    return (
      <p className="text-sm text-rose-300">
        No pudimos cargar tu tienda. Probá recargar la página.
      </p>
    );
  }

  const pending = createMu.isPending || updateMu.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-300">
          Panel
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-300">Mi tienda</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/90">
          Identidad pública
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Configuración de tu tienda
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Personalizá cómo verán tu tienda tus clientes en{' '}
          <span className="font-mono text-indigo-200">/tienda/{slug || 'tu-slug'}</span>. Podés
          actualizar estos datos cuando quieras.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/35 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8">
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Identidad</h2>
            <p className="mt-1 text-sm text-zinc-500">Nombre público y URL única de tu vitrina.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Nombre de la tienda</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Café del Centro"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Slug (URL)</label>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="caf-del-centro"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
              <p className="mt-1 text-xs text-zinc-500">Solo minúsculas, números y guiones.</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Contá qué vendés y por qué elegirte."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-indigo-500/30 placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/35 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8">
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Contacto</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Este número puede mostrarse en tu tienda pública para consultas y pedidos.
            </p>
          </div>
          <PhoneField
            label="Teléfono del negocio"
            value={phone}
            onChange={(v) => {
              setPhone(v);
              setPhoneError(null);
            }}
            error={phoneError}
            disabled={pending}
            required
            hint="Incluí código de país. Ejemplo: Argentina +54."
          />
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/35 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8">
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Marca</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Logo opcional. Se sube a Supabase Storage con tu sesión.
            </p>
          </div>
          <ImageDropzone
            label="Logo de la tienda"
            bucket="logos"
            buildPath={logoPathBuilder}
            value={logoUrl}
            onChange={(url) => setLogoUrl(url)}
            disabled={pending || !user?.id}
            hint={
              !user?.id
                ? 'Esperando usuario…'
                : 'Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el backend.'
            }
          />
          {!logoUrl ? (
            <p className="mt-3 text-xs text-zinc-600">
              También podés pegar una URL manualmente si ya tenés el archivo hospedado:
            </p>
          ) : null}
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://… (alternativa manual)"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 font-mono text-xs text-zinc-300 outline-none ring-indigo-500/30 focus:ring-2"
          />
        </section>

        {msg ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              msg.includes('correctamente') || msg.includes('guardados')
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
            }`}
          >
            {msg}
          </div>
        ) : null}

        <div className="sticky bottom-4 z-10 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 hover:shadow-indigo-900/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : exists ? 'Guardar cambios' : 'Crear mi tienda'}
          </button>
        </div>
      </form>
    </div>
  );
}
