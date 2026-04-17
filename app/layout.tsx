import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import { env } from '@/lib/env';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const metadata: Metadata = { title: 'LegalAI', description: 'Intelligence per il Penale' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <AppProvider>{children}</AppProvider>
  );

  return (
    <html lang="it">
      <body className={`${inter.variable} ${mono.variable} bg-[#0a1929] text-[#d9e2ec] font-sans antialiased`}>
        {env.clerkPublishableKey ? (
          <ClerkProvider publishableKey={env.clerkPublishableKey}>{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
