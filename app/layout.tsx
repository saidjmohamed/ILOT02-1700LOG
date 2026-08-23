import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'خزينة الحي | Ilot 2 – 1700 مسكن',
  description: 'التسيير المالي الرقمي لحي Ilot 2 – 1700 مسكن بوعنقود، بوينان، البليدة',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
