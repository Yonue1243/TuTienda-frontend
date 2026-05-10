'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { LandingPreview } from './landing-preview';

export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };
  const previewMotion = reduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay: 0.15 } };

  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.14), transparent 55%)`,
        }}
      />
      <PageContainer className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <motion.p
              className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
              {...fade}
              transition={{ duration: reduceMotion ? 0 : 0.45 }}
            >
              Catálogo y pedidos
            </motion.p>
            <motion.h1
              className="mt-5 text-[2.125rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
              {...fade}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.06 }}
            >
              Tu tienda online,
              <span className="block text-zinc-400">lista cuando vos estés.</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-[15px] leading-relaxed text-zinc-400 sm:text-base"
              {...fade}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.12 }}
            >
              Registrate, elegí tu URL, cargá productos y recibí pedidos organizados en un panel
              limpio. Sin integrar pagos: vos cerrás por los canales que ya usás.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-3"
              {...fade}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.18 }}
            >
              <Button size="lg" className="h-11 rounded-full px-7 text-[13px] font-medium shadow-none" asChild>
                <Link href="/crear-tu-tienda">Empezar gratis</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full border-white/[0.12] bg-transparent px-7 text-[13px] font-medium text-zinc-200 hover:bg-white/[0.05]"
                asChild
              >
                <Link href="/tienda/tienda-demo">Ver demo</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div {...previewMotion}>
            <LandingPreview />
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
