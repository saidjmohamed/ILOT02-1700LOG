import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'إيلو 02 — 1700 مسكن',
  description: 'نظام تسيير سكان وخزائن حي 1700 مسكن بوعنقود — إيلو 02',
  manifest: '/manifest.webmanifest',
  applicationName: 'إيلو 02',
  appleWebApp: { capable: true, title: 'إيلو 02', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f3d2a',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
