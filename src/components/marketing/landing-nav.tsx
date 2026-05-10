import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
      <PageContainer className="flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-white">
          Tu Tienda
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-white/[0.06] hover:text-white" asChild>
            <Link href="/crear-tu-tienda">Entrar</Link>
          </Button>
          <Button size="sm" className="rounded-full px-4 shadow-none" asChild>
            <Link href="/crear-tu-tienda">Crear tienda</Link>
          </Button>
        </nav>
      </PageContainer>
    </header>
  );
}
