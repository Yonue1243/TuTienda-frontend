import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-indigo-950/40 text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Tu Tienda</span>
        <div className="flex gap-3 text-sm">
          <Link href="/crear-tu-tienda" className="text-zinc-300 hover:text-white">
            Entrar
          </Link>
          <Link
            href="/crear-tu-tienda"
            className="rounded-full bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400"
          >
            Crear mi tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <section className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">
              SaaS para comercios
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Tu vitrina online lista en minutos
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-400">
              Registrate, personalizá tu tienda con slug propio, cargá productos y recibí pedidos por
              WhatsApp u otros canales. Sin pasarela de pagos: foco en catálogo y demanda real.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/crear-tu-tienda"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                Empezar gratis
              </Link>
              <Link
                href="/tienda/tienda-demo"
                className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
              >
                Ver demo pública
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
                <div>
                  <p className="text-xs text-zinc-500">Panel</p>
                  <p className="font-medium">Pedidos nuevos</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  +12 hoy
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
                  <p className="text-xs text-zinc-500">Productos</p>
                  <p className="mt-1 text-2xl font-semibold">128</p>
                </div>
                <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
                  <p className="text-xs text-zinc-500">Visitas</p>
                  <p className="mt-1 text-2xl font-semibold">4.2k</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                <p className="text-sm opacity-90">URL pública</p>
                <p className="mt-2 font-mono text-sm md:text-base">tutienda.com/tienda/tu-slug</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-8 md:grid-cols-3">
          {[
            {
              title: 'Marca propia',
              body: 'Nombre, descripción, logo y slug único para compartir tu vitrina.',
            },
            {
              title: 'Pedidos claros',
              body: 'Cliente, teléfono, notas y detalle de ítems guardados en tu panel.',
            },
            {
              title: 'Sin fricción de pagos',
              body: 'Cerrá ventas por los medios que ya usás; nosotros ordenamos el pedido.',
            },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h3 className="text-lg font-semibold text-white">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{b.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-10 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">¿Listo para abrir tu canal digital?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Creá tu cuenta, configurá la tienda y compartí el link con tus clientes.
          </p>
          <Link
            href="/crear-tu-tienda"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
          >
            Crear mi tienda
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-10 text-center text-xs text-zinc-600">
        Tu Tienda — MVP production-ready · NestJS + Next.js + Prisma + Supabase
      </footer>
    </div>
  );
}
