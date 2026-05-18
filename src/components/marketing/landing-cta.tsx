'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

export function LandingCta() {
  return (
    <section className="py-20 sm:py-28">
      <PageContainer size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-14 text-center sm:px-12"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Abrí tu canal digital hoy
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            Creá la cuenta, configurá la tienda en minutos y compartí el link con tus clientes.
          </p>
          <Button className="mt-9 h-11 rounded-full px-8 text-[13px] font-medium shadow-none" size="lg" asChild>
            <Link href="/crear-tu-tienda">Crear mi tienda</Link>
          </Button>
        </motion.div>
      </PageContainer>
    </section>
  );
}
