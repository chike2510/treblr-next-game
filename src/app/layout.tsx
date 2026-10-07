import type { Metadata } from 'next';
import { Anton, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './theme.css';

const poster = Anton({ subsets: ['latin'], weight: '400', variable: '--font-poster', display: 'swap' });
const ui = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-ui', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'TREBLR — An artist’s life, on your terms',
  description: 'A living music-industry world. Make records, meet people, travel cities, and build a career that feels like yours.',
  applicationName: 'TREBLR',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${poster.variable} ${ui.variable} ${mono.variable}`}><body>{children}</body></html>;
}
