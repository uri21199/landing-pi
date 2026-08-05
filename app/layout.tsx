import type { Metadata } from 'next';
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Proyecto Ingeniería FIUBA',
  description:
    'Herramientas para estudiantes de la Facultad de Ingeniería (UBA): planes de estudio y mapa de la sede.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-screen overflow-hidden">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
