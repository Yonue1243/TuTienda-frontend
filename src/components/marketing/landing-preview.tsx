export function LandingPreview() {
  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-1 shadow-none ring-1 ring-white/[0.04]">
      <div className="overflow-hidden rounded-[calc(1rem-2px)] bg-zinc-950">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="size-2 rounded-full bg-white/[0.12]" />
          <span className="size-2 rounded-full bg-white/[0.08]" />
          <span className="size-2 rounded-full bg-white/[0.08]" />
          <span className="ml-3 font-mono text-[11px] text-zinc-600">panel.tutienda.app</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Pedidos</p>
              <p className="mt-0.5 text-sm font-medium text-zinc-100">Nuevos</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              +12 hoy
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] text-zinc-500">Productos</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-white">128</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[11px] text-zinc-500">Visitas</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-white">4.2k</p>
            </div>
          </div>
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] px-4 py-4">
            <p className="text-[11px] font-medium text-indigo-300/90">URL pública</p>
            <p className="mt-1 break-all font-mono text-[12px] text-zinc-200">
              tutienda.com/tienda/tu-slug
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
