import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <PageContainer className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-center text-xs text-zinc-600 sm:text-left">
          © {new Date().getFullYear()} Tu Tienda · NestJS · Next.js · Prisma · Supabase
        </p>
        <Link
          href="/crear-tu-tienda"
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Panel del comerciante →
        </Link>
      </PageContainer>
    </footer>
  );
}
