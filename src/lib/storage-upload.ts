import { api } from '@/lib/api';

export type SignUploadResponse = {
  bucket: string;
  path: string;
  signedUrl: string;
  token: string;
  publicUrl: string | null;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(jpeg|png|webp|gif)$/i;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.test(file.type)) {
    return 'Solo imágenes JPG, PNG, WEBP o GIF.';
  }
  if (file.size > MAX_BYTES) {
    return 'La imagen supera 5 MB.';
  }
  return null;
}

export function extensionFromFileName(name: string): string {
  const i = name.lastIndexOf('.');
  if (i < 0) return '.webp';
  const ext = name.slice(i).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return '.webp';
  }
  return ext;
}

export async function uploadViaSignedUrl(
  bucket: 'logos' | 'product-images' | 'banners' | 'carousel',
  path: string,
  file: File,
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data } = await api.post<SignUploadResponse>('/storage/sign-upload', {
    bucket,
    path,
  });

  const headers: Record<string, string> = {
    'Content-Type': file.type || 'application/octet-stream',
  };
  if (data.token) {
    headers.Authorization = `Bearer ${data.token}`;
  }

  const res = await fetch(data.signedUrl, {
    method: 'PUT',
    body: file,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Error al subir la imagen (${res.status})`);
  }

  if (!data.publicUrl) {
    throw new Error(
      'No hay URL pública para el archivo. En Supabase definí los buckets como públicos y revisá SUPABASE_URL en el backend.',
    );
  }

  return data.publicUrl;
}
