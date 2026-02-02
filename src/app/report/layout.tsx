import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SPARQ Report - Athletic Performance Analysis',
  description: 'Calculate your SPARQ rating and get personalized athletic performance insights',
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gmtm-bg`}>
        {children}
      </body>
    </html>
  );
}
