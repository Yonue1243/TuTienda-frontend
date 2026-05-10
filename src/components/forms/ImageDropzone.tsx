'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadViaSignedUrl, validateImageFile } from '@/lib/storage-upload';

type Bucket = 'logos' | 'product-images';

type Props = {
  label: string;
  bucket: Bucket;
  buildPath: (file: File) => string;
  value: string | null | undefined;
  onChange: (publicUrl: string) => void;
  disabled?: boolean;
  hint?: string;
  required?: boolean;
};

export function ImageDropzone({
  label,
  bucket,
  buildPath,
  value,
  onChange,
  disabled,
  hint,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!value) {
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [value]);

  const displaySrc = localPreview || value || null;

  async function processFile(file: File) {
    setError(null);
    const v = validateImageFile(file);
    if (v) {
      setError(v);
      return;
    }

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);

    setUploading(true);
    try {
      const path = buildPath(file);
      const url = await uploadViaSignedUrl(bucket, path, file);
      onChange(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo subir la imagen';
      setError(msg);
      URL.revokeObjectURL(blobUrl);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium tracking-wide text-zinc-400">
          {label}
          {required ? <span className="text-rose-400"> *</span> : null}
        </label>
        {value && !required ? (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => {
              if (localPreview) URL.revokeObjectURL(localPreview);
              setLocalPreview(null);
              onChange('');
            }}
            className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline disabled:opacity-50"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`group relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
          dragOver
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 hover:bg-zinc-900/40'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled || uploading}
        />

        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            className="max-h-40 w-auto max-w-full rounded-lg object-contain shadow-lg ring-1 ring-zinc-800"
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-200">
              Arrastrá una imagen o hacé clic para elegir
            </span>
            <span className="text-xs text-zinc-500">JPG, PNG, WEBP o GIF · máx. 5 MB</span>
          </div>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/75 backdrop-blur-sm">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
        ) : null}
      </button>

      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
