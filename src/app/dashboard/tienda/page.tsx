'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import type { StorePublic, StoreSettingsDto } from '@/lib/types';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { PhoneField } from '@/components/forms/PhoneField';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { extensionFromFileName } from '@/lib/storage-upload';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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

  const notFound = q.error instanceof AxiosError && q.error.response?.status === 404;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [logoUrl, setLogoUrl] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const s = q.data;
    if (!s?.id) return;
    setName(s.name);
    setSlug(s.slug);
    setDescription(s.description ?? '');
    setPhone(s.phone ?? undefined);
    setLogoUrl(s.logoUrl ?? '');
    const st = s.settings;
    if (st) {
      setShowBanner(st.showBanner);
      setBannerUrl(st.bannerUrl ?? '');
    }
    // Hidratar solo cuando cambia la tienda (id); no en cada refetch de React Query (evita reset al subir banner).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps intencionales: [q.data?.id]
  }, [q.data?.id]);

  const updateBannerMu = useMutation({
    mutationFn: async (body: Pick<StoreSettingsDto, 'showBanner' | 'bannerUrl'>) => {
      const { data } = await api.patch<StoreSettingsDto>('/stores/me/settings', body);
      return data;
    },
    onSuccess: async (data) => {
      setMsg('Banner actualizado.');
      setShowBanner(data.showBanner);
      setBannerUrl(data.bannerUrl ?? '');
      await qc.invalidateQueries({ queryKey: ['store', 'me'] });
    },
    onError: (e: unknown) => {
      const ax = e as AxiosError<{ message?: string | string[] }>;
      const m = ax.response?.data?.message;
      setMsg(Array.isArray(m) ? m.join(', ') : m ?? 'No se pudo guardar el banner');
    },
  });

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
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-3 border-b border-white/[0.06] pb-8">
          <Skeleton className="h-9 w-64 bg-white/[0.06]" />
          <Skeleton className="h-4 w-full max-w-lg bg-white/[0.06]" />
        </div>
        <Skeleton className="h-56 rounded-xl bg-white/[0.06]" />
        <Skeleton className="h-48 rounded-xl bg-white/[0.06]" />
      </div>
    );
  }

  if (q.isError && !notFound) {
    return (
      <div className="mx-auto max-w-lg">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No pudimos cargar tu tienda. Probá recargar la página.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pending = createMu.isPending || updateMu.isPending;
  const bannerPending = updateBannerMu.isPending;
  const msgOk =
    msg &&
    (msg.includes('correctamente') || msg.includes('guardados') || msg.includes('guardado'));

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <PageHeader
        title="Mi tienda"
        description={
          <>
            Personalizá cómo verán tu vitrina en{' '}
            <span className="font-mono text-zinc-300">/tienda/{slug || 'tu-slug'}</span>.
          </>
        }
        actions={
          exists && slug ? (
            <Button variant="outline" size="sm" className="rounded-full border-white/[0.1]" asChild>
              <Link href={`/tienda/${slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Ver pública
              </Link>
            </Button>
          ) : null
        }
      />

      <form onSubmit={submit} className="space-y-8">
        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle className="text-lg">Identidad</CardTitle>
            <CardDescription>Nombre público y URL única de tu vitrina.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="store-name">Nombre de la tienda</Label>
              <Input
                id="store-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Café del Centro"
                className="border-white/[0.08] bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-slug">Slug (URL)</Label>
              <Input
                id="store-slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="caf-del-centro"
                className="border-white/[0.08] bg-zinc-950 font-mono text-sm"
              />
              <p className="text-[11px] text-zinc-500">Solo minúsculas, números y guiones.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="store-desc">Descripción</Label>
              <Textarea
                id="store-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Contá qué vendés y por qué elegirte."
                className="border-white/[0.08] bg-zinc-950"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle className="text-lg">Contacto</CardTitle>
            <CardDescription>
              Este número puede mostrarse en tu tienda pública para consultas y pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle className="text-lg">Marca</CardTitle>
            <CardDescription>
              Logo opcional. Se sube a Supabase Storage con tu sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
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
          </CardContent>
        </Card>

        {exists && q.data?.id ? (
          <Card className="border-white/[0.06] bg-white/[0.02] shadow-none">
            <CardHeader className="border-b border-white/[0.06] pb-4">
              <CardTitle className="text-lg">Banner</CardTitle>
              <CardDescription>
                Imagen ancha en la parte superior de tu tienda pública (opcional). El estilo es fijo en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="show-banner-tienda">Mostrar banner</Label>
                  <p className="text-xs text-zinc-500">Requiere una imagen cargada.</p>
                </div>
                <Switch
                  id="show-banner-tienda"
                  checked={showBanner}
                  onCheckedChange={setShowBanner}
                  disabled={bannerPending}
                />
              </div>
              <ImageDropzone
                label="Imagen del banner"
                bucket="banners"
                buildPath={(file) =>
                  `${q.data!.id}/banner-${Date.now()}${extensionFromFileName(file.name)}`
                }
                value={bannerUrl}
                onChange={(url) => setBannerUrl(url?.trim() ?? '')}
                disabled={bannerPending || !user?.id}
                hint="Formato panorámico recomendado."
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                disabled={bannerPending}
                onClick={() => {
                  setMsg(null);
                  updateBannerMu.mutate({
                    showBanner,
                    bannerUrl: bannerUrl.trim() ? bannerUrl.trim() : null,
                  });
                }}
              >
                {bannerPending ? 'Guardando…' : 'Guardar banner'}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {msg ? (
          <Alert variant={msgOk ? 'default' : 'destructive'} className="border-white/[0.08]">
            <AlertTitle>{msgOk ? 'Listo' : 'Algo salió mal'}</AlertTitle>
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        ) : null}

        <div className="sticky bottom-4 z-10 flex justify-end pt-2">
          <Button type="submit" disabled={pending} className="rounded-full px-8 shadow-none">
            {pending ? 'Guardando…' : exists ? 'Guardar cambios' : 'Crear mi tienda'}
          </Button>
        </div>
      </form>
    </div>
  );
}
