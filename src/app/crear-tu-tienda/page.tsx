'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/lib/types';

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
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold">
          Tu Tienda
        </Link>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          Volver al inicio
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">Creá tu tienda</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login'
              ? 'Ingresá con tu cuenta para administrar tu tienda.'
              : 'Registrate para obtener tu panel y tu URL pública.'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-zinc-950/80 p-1 ring-1 ring-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-medium ${
                mode === 'login' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-medium ${
                mode === 'register' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Registrarme
            </button>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-zinc-400">Nombre</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/40 focus:ring-2"
                  placeholder="Tu nombre o el del negocio"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/40 focus:ring-2"
                placeholder="vos@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Contraseña</label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none ring-indigo-500/40 focus:ring-2"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {pending ? 'Procesando…' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
