'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset="1rem"
      gap={10}
      visibleToasts={3}
      toastOptions={{
        duration: 2200,
        classNames: {
          toast:
            'group rounded-xl border border-zinc-200/90 bg-white/95 px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-50',
          title: 'text-[13px] font-medium leading-snug sm:text-sm',
          description: 'text-xs text-zinc-500 dark:text-zinc-400',
          success: 'border-emerald-200/80 dark:border-emerald-800/80',
          error: 'border-red-200/80 dark:border-red-900/60',
          closeButton:
            'absolute right-2 top-2 rounded-md border-0 bg-transparent text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
        },
      }}
      className="toaster"
      closeButton
    />
  );
}
