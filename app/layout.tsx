import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Crux B1 Exam Trainer | Polish Certification',
  description: 'Master Polish B1 exam vocabulary with 3D Pokemon-style cards, quizzes, and binder dictionary.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0b0f19] text-[#E2E8F0] flex flex-col">
        {children}
      </body>
    </html>
  );
}
