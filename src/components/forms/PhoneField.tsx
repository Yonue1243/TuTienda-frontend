'use client';

import PhoneInput from 'react-phone-number-input';
import es from 'react-phone-number-input/locale/es.json';
import 'react-phone-number-input/style.css';

type Props = {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  error?: string | null;
  disabled?: boolean;
  hint?: string;
  required?: boolean;
};

export function PhoneField({
  label,
  value,
  onChange,
  error,
  disabled,
  hint,
  required,
}: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium tracking-wide text-zinc-400">
        {label}
        {required ? <span className="text-rose-400"> *</span> : null}
      </label>
      <PhoneInput
        international
        defaultCountry="AR"
        labels={es}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="phone-field-root flex rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-1.5 ring-indigo-500/30 transition focus-within:border-indigo-500/50 focus-within:ring-2"
        numberInputProps={{
          className:
            'min-w-0 flex-1 bg-transparent py-2 pl-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600',
          placeholder: 'Tu número',
          required,
        }}
      />
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
