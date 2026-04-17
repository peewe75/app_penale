'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { env } from '@/lib/env';

export default function SignUpPage() {
  if (!env.clerkPublishableKey) {
    return (
      <div className="min-h-screen bg-[#07111f] px-6 py-16 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 text-center">
          <p className="text-xl font-bold">Clerk non configurato in locale</p>
          <p className="text-sm text-slate-300">Imposta le chiavi Clerk B per usare registrazione e dashboard condivise con BCS.</p>
          <Link href="/landing" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-slate-950">
            Torna alla landing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
