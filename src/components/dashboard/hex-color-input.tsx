'use client';

import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function normalizeHex(v: string): string {
  const t = v.trim();
  if (!t) return '#000000';
  return t.startsWith('#') ? t : `#${t}`;
}

export function HexColorInput({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(value.trim()) ? normalizeHex(value) : '#6366f1';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'h-9 w-11 shrink-0 rounded-md border border-border shadow-inner',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              style={{ backgroundColor: safe }}
              aria-label={`Elegir ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto border-border bg-card p-3">
            <HexColorPicker color={safe} onChange={(c) => onChange(c)} />
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          className="font-mono text-xs uppercase"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
