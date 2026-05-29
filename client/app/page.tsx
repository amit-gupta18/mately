import Link from 'next/link';
import { LandingCTA } from '@/components/landing/LandingCTA';

const FEATURES = [
  { icon: '🚪', title: 'Virtual Study Rooms', desc: 'Create public or private rooms. Invite teammates and study alongside real people in real time.' },
  { icon: '⏱️', title: 'Shared Study Timer', desc: 'One timer, synced across every participant. No drift, no confusion — everyone sees the same clock.' },
  { icon: '💬', title: 'Live Room Chat', desc: 'Discuss problems and share resources without ever leaving the room.' },
  { icon: '📊', title: 'Session History', desc: 'Every session saved automatically. Track total hours, streaks, and your longest focus blocks.' },
];

const STEPS = [
  { step: '01', title: 'Create an account', desc: 'Sign up in seconds — no credit card required.' },
  { step: '02', title: 'Open or join a room', desc: 'Browse public rooms or spin up your own study space.' },
  { step: '03', title: 'Start the timer & focus', desc: 'Hit Start, silence distractions, get things done.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-yellow font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-black text-brand-black tracking-tight">Mately ⚡</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="rounded-full bg-brand-black px-5 py-2 text-sm font-black text-brand-yellow hover:bg-brand-black/80 transition-colors border-2 border-brand-black">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="dot-grid px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-brand-black bg-brand-white px-4 py-1.5 text-sm font-bold text-brand-black shadow-[2px_2px_0px_#0A0A0A]">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Real-time collaborative study rooms
          </div>

          <h1 className="text-6xl sm:text-7xl font-black text-brand-black leading-none tracking-tight">
            TURN YOUR<br />
            <span className="relative inline-block">
              <span className="relative z-10">CHAOS</span>
              <span className="absolute inset-0 -bottom-1 bg-brand-white rounded-lg -skew-x-3 z-0" />
            </span>
            {' '}INTO<br />
            FOCUS.
          </h1>

          <p className="text-lg font-medium text-brand-black/60 max-w-xl leading-relaxed">
            Stop studying alone. Mately gives you real-time rooms with a shared timer, live chat, and session tracking — so your whole group stays in sync.
          </p>

          <LandingCTA />

          <p className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">
            No credit card · Free forever · Works in any browser
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-brand-black px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-brand-white mb-3">Everything you need.</h2>
            <p className="text-brand-white/40 font-medium">Nothing you don&apos;t.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border-2 border-white/10 bg-white/5 p-6 hover:bg-brand-yellow hover:border-brand-yellow group transition-all">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-black text-brand-white group-hover:text-brand-black mb-2">{title}</h3>
                <p className="text-sm font-medium text-brand-white/50 group-hover:text-brand-black/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-brand-yellow dot-grid">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-brand-black">Up and running in 60 seconds.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="rounded-2xl border-2 border-brand-black bg-brand-white p-6 shadow-[4px_4px_0px_#0A0A0A]">
                <div className="text-4xl font-black text-brand-black/10 mb-3">{step}</div>
                <h3 className="font-black text-brand-black mb-1">{title}</h3>
                <p className="text-sm font-medium text-brand-black/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-black px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-5xl font-black text-brand-yellow">Ready to focus?</h2>
          <p className="font-medium text-brand-white/50">Join your first study room in under a minute.</p>
          <Link href="/register" className="rounded-full bg-brand-yellow px-8 py-4 text-base font-black text-brand-black border-2 border-brand-yellow hover:bg-brand-yellow/90 transition-all shadow-[4px_4px_0px_rgba(245,228,66,0.3)]">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-brand-black/10 bg-brand-yellow px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-brand-black/40">
          <span className="font-black text-brand-black">Mately ⚡</span>
          <span>© {new Date().getFullYear()} Mately. Built with Next.js + Socket.io.</span>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-brand-black transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-brand-black transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-brand-black transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
