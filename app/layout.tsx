import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Crux | Learn Languages via Local News',
  description: 'Read the crux of local news in 1 minute. Tap words for translations and synonyms, and track your vocabulary without cognitive overload.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0B0813] text-[#E2E8F0] flex flex-col">
        {/* Main Content Area: Centered mobile wrapper */}
        <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-24 md:px-6">
          {children}
        </main>
        
        {/* Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
