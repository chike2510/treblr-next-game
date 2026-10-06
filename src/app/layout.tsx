import type { Metadata } from 'next';
import { Anton, Archivo, JetBrains_Mono } from 'next/font/google';
import '@/styles/legacy-base.css';
import '@/styles/legacy-world.css';
import '@/styles/legacy-panels.css';
import '@/styles/legacy-phone.css';
import '@/styles/legacy-pages.css';
import '@/styles/tokens.css';
import '@/styles/components.css';
import '@/styles/hud.css';
import '@/styles/panels.css';
import '@/styles/phone.css';
import '@/styles/pages.css';

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
