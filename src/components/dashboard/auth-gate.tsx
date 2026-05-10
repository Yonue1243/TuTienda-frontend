'use client';

import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) {
      router.replace('/crear-tu-tienda');
    }
  }, [accessToken, hydrated, router]);

  if (!hydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
          <p className="text-sm text-zinc-400">
            {!hydrated ? 'Restaurando sesión…' : 'Redirigiendo…'}
          </p>
          {hydrated && !accessToken && (
            <Link href="/crear-tu-tienda" className="mt-4 inline-block text-indigo-400">
              Ir a iniciar sesión
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
