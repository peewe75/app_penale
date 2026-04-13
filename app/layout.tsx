import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const metadata: Metadata = { title: 'LegalAI', description: 'Intelligence per il Penale' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${mono.variable} bg-[#0a1929] text-[#d9e2ec] font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
