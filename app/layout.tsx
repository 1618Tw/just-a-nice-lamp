import type { Metadata } from 'next';
import { MobileLoader } from '@/components/MobileLoader';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Just a Nice Lamp',
  description: 'A perfect form. Warmth redefined.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ivory text-ink antialiased">
        <MobileLoader />
        <Nav />
        {children}
      </body>
    </html>
  );
}
