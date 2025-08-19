import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | FitTracker Pro v2.0',
    default: 'FitTracker Pro v2.0',
  },
  description: 'Aplicación moderna de seguimiento fitness con sincronización en la nube',
  manifest: '/manifest.json',
  themeColor: '#ea580c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitTracker Pro',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FitTracker Pro" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}