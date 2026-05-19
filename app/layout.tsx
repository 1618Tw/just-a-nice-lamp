import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Just a Nice Lamp',
  description: 'A perfect form. Warmth redefined.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="bg-ivory text-ink antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
