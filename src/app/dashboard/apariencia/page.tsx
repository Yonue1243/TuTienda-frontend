'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** La personalización visual se unificó en la plataforma; el contenido vive en Contenido y Mi tienda. */
export default function AparienciaRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/contenido');
  }, [router]);
  return (
    <div className="mx-auto max-w-md py-16 text-center text-sm text-zinc-400">
      Redirigiendo…
    </div>
  );
}
