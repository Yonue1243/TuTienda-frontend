'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, PackageSearch, WalletCards } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';

const items = [
  {
    icon: LayoutGrid,
    title: 'Marca propia',
    body: 'Nombre, logo y slug único. Una vitrina que se siente tuya, no genérica.',
  },
  {
    icon: PackageSearch,
    title: 'Pedidos ordenados',
    body: 'Cliente, teléfono, ítems y notas en un solo lugar para despachar sin errores.',
  },
  {
    icon: WalletCards,
    title: 'Sin fricción de cobros',
    body: 'Cerrá por WhatsApp, transferencia o lo que ya uses; nosotros registramos el pedido.',
  },
];

export function LandingBenefits() {
  return (
    <section className="border-t border-white/[0.06] py-20 sm:py-24">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Por qué Tu Tienda
          </h2>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Menos configuración. Más ventas claras.
          </p>
        </motion.div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.1] hover:bg-white/[0.035]"
            >
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-colors group-hover:text-white">
                <item.icon className="size-[18px]" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
