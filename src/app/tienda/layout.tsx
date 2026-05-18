import { DM_Sans } from 'next/font/google';
import { TiendaToaster } from './tienda-toaster';

const storefrontSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${storefrontSans.className} min-h-screen antialiased`}>
      {children}
      <TiendaToaster />
    </div>
  );
}
