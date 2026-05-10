'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/lib/types';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export default function CrearTuTiendaPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loginMu = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
      router.replace('/dashboard');
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(typeof msg === 'string' ? msg : 'No pudimos iniciar sesión');
    },
  });

  const registerMu = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        name,
      });
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
      router.replace('/dashboard');
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : null;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      setError(typeof text === 'string' ? text : 'No pudimos crear la cuenta');
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'login') {
      loginMu.mutate();
    } else {
      registerMu.mutate();
    }
  }

  const pending = loginMu.isPending || registerMu.isPending;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <PageContainer className="flex items-center justify-between py-5">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            TuTienda
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
          >
            Volver al inicio
          </Link>
        </PageContainer>
      </header>

      <main className="flex flex-1 justify-center px-6 pb-16 pt-12 md:pt-16">
        <Card className="w-full max-w-md border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">Creá tu tienda</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              {mode === 'login'
                ? 'Ingresá con tu cuenta para administrar tu tienda.'
                : 'Registrate para obtener tu panel y tu URL pública.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
              role="tablist"
              aria-label="Modo de acceso"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  mode === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  mode === 'register'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Registrarme
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Nombre</Label>
                  <Input
                    id="auth-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre o el del negocio"
                    autoComplete="name"
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Aparecerá en tu cuenta y en comunicaciones de soporte.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Contraseña</Label>
                <Input
                  id="auth-password"
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>No se pudo completar</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" disabled={pending} className="w-full rounded-full shadow-none">
                {pending ? 'Procesando…' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
