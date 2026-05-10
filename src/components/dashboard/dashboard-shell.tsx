'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

const nav = [
  { href: '/dashboard', label: 'Resumen' },
  { href: '/dashboard/tienda', label: 'Mi tienda' },
  { href: '/dashboard/apariencia', label: 'Apariencia' },
  { href: '/dashboard/productos', label: 'Productos' },
  { href: '/dashboard/pedidos', label: 'Pedidos' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  async function logout() {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      /* ignorar */
    } finally {
      clear();
      router.replace('/crear-tu-tienda');
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/80 p-6 md:block">
        <Link href="/" className="block text-lg font-semibold tracking-tight text-white">
          Tu Tienda
        </Link>
        <p className="mt-1 text-xs text-zinc-500">Panel del comerciante</p>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/dashboard" className="font-semibold text-white">
                Tu Tienda
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden max-w-[200px] truncate text-sm text-zinc-400 sm:inline">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Salir
              </button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                    active ? 'bg-indigo-500/20 text-indigo-200' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
