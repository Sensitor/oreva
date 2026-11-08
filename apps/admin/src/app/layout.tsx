import '@fontsource-variable/manrope';
import '@fontsource-variable/onest';
import { cssVariablesRule } from '@oreva/tokens';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getRequestLocale } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'ORÉVA',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <style>{cssVariablesRule()}</style>
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
