import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';
import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-d',
  weight: ['600', '700'],
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-b',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pathwise: see the path, fix the floor',
  description: 'Retail floor flow analytics and layout optimization platform. See the path, fix the floor.',
  openGraph: {
    title: 'Pathwise: see the path, fix the floor',
    description: 'Retail floor flow analytics and layout optimization platform. See the path, fix the floor.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathwise: see the path, fix the floor',
    description: 'Retail floor flow analytics and layout optimization platform. See the path, fix the floor.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolageGrotesque.variable} ${instrumentSans.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-[#EEF1F7] dark:bg-[#10131E] text-[#1C2540] dark:text-[#E8EBF6] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
