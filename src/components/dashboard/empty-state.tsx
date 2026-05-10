import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export function DashboardEmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-8 py-14 text-center">
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className={`font-semibold text-white ${Icon ? 'mt-5' : ''}`}>{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
      {action ? (
        <Button className="mt-8 rounded-full px-6 shadow-none" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
