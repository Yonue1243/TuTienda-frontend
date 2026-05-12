import { DM_Sans } from 'next/font/google';

const storefrontSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${storefrontSans.className} min-h-screen antialiased`}>{children}</div>;
}
