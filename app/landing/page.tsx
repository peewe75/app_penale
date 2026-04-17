'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Shield, Scale, Database, Sparkles, Lock } from 'lucide-react';
import { env } from '@/lib/env';

const highlights = [
  {
    icon: Scale,
    title: 'Landing free',
    body: 'Entri senza barriera economica e scopri il fascicolo penale digitale prima di attivare eventuali piani.',
  },
  {
    icon: Database,
    title: 'DB unico BCS',
    body: 'Fascicoli, segmenti e timeline finiscono nello stesso backend che alimenta BCS e la dashboard amministrativa.',
  },
  {
    icon: Shield,
    title: 'Clerk B condiviso',
    body: 'La registrazione usa lo stesso progetto Clerk già attivo su ultrabot.space, senza auth separata.',
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(180deg,_rgba(7,17,31,0.96),_rgba(7,17,31,1))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Legal AI Penale in BCS
            </span>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Fascicolo penale digitale, ora dentro il sistema BCS.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Landing free, login condiviso con Clerk B e billing centralizzato da BCS admin tramite Stripe.
                L&apos;esperienza resta su Netlify, ma il controllo passa al backend unico di ultrabot.space.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {env.clerkPublishableKey ? (
                <>
                  <SignedOut>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
                    >
                      Inizia gratis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
                    >
                      Accedi
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
                    >
                      Apri dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </SignedIn>
                </>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
                >
                  Inizia gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href={`${env.bcsAppUrl}/admin`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                BCS admin
              </Link>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Auth</p>
                <p className="mt-1">Clerk B, stesso progetto usato da ultrabot.space.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Billing</p>
                <p className="mt-1">Stripe resta solo in BCS admin, niente chiavi locali.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Data</p>
                <p className="mt-1">Casi, segmenti e timeline puntano al DB unico Supabase BCS.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-[24px] border border-white/10 bg-[#0b1628] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Accesso centralizzato</p>
                    <h2 className="mt-2 text-2xl font-bold">Da landing a dashboard</h2>
                  </div>
                  <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                    <Lock className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-slate-300">
                  {highlights.map((item) => (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
                      <div className="rounded-xl bg-white/8 p-3 text-amber-300">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 leading-6">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
