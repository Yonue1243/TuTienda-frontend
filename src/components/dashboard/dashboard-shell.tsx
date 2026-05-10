'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  Store as StoreIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/tienda', label: 'Mi tienda', icon: StoreIcon },
  { href: '/dashboard/apariencia', label: 'Apariencia', icon: Palette },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
] as const;

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {nav.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
              active
                ? 'bg-white/[0.06] text-white'
                : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
            )}
          >
            <Icon className="size-[18px] shrink-0 opacity-80" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      /* ignorar */
    } finally {
      clear();
      setMobileOpen(false);
      router.replace('/crear-tu-tienda');
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur md:flex">
        <div className="flex flex-col gap-1 px-4 pb-4 pt-5">
          <Link href="/" className="px-3 text-[15px] font-semibold tracking-tight text-white">
            Tu Tienda
          </Link>
          <p className="px-3 text-[11px] uppercase tracking-[0.12em] text-zinc-500">Panel</p>
        </div>
        <Separator className="bg-white/[0.06]" />
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks pathname={pathname} />
        </div>
        <div className="mt-auto border-t border-white/[0.06] p-4">
          <Link href="/" className="block px-3 text-[12px] text-zinc-500 hover:text-zinc-300">
            ← Sitio público
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-zinc-950/85 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/70">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-[3.25rem] sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-white/[0.06]" aria-label="Abrir menú">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-[min(100vw-3rem,280px)] flex-col gap-0 border-white/[0.06] bg-zinc-950 p-0">
                  <div className="border-b border-white/[0.06] px-6 pb-4 pt-6">
                    <SheetTitle className="text-left text-[15px] font-semibold">Tu Tienda</SheetTitle>
                    <p className="mt-1 text-[11px] text-zinc-500">Navegación</p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-4">
                    <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <div className="border-t border-white/[0.06] p-4">
                    <Button variant="outline" className="w-full border-white/[0.1]" asChild>
                      <Link href="/" onClick={() => setMobileOpen(false)}>
                        Ir al sitio
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="text-[13px] font-semibold text-white md:hidden">Dashboard</span>
            </div>

            <div className="hidden md:block">
              <span className="text-[13px] font-medium text-zinc-500">Panel del comerciante</span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="max-w-[220px] gap-2 truncate text-[13px] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="truncate">{user?.email ?? 'Cuenta'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border bg-card">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/">Sitio público</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => void logout()}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
