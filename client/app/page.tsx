import Link from 'next/link';
import { LandingCTA } from '@/components/landing/LandingCTA';

const FEATURES = [
  {
    icon: '🚪',
    title: 'Virtual Study Rooms',
    desc: 'Create public or private rooms for any subject. Invite teammates and study alongside real people.',
  },
  {
    icon: '⏱️',
    title: 'Shared Study Timer',
    desc: 'Start a session timer that syncs across every participant in real time. No drift, no confusion.',
  },
  {
    icon: '💬',
    title: 'Live Room Chat',
    desc: 'Discuss problems, share resources, and keep each other accountable without leaving the room.',
  },
  {
    icon: '📊',
    title: 'Session History',
    desc: 'Every session is saved automatically. Track your total hours, streaks, and longest sessions.',
  },
];

const STEPS = [
  { step: '01', title: 'Create an account', desc: 'Sign up in seconds — no credit card required.' },
  { step: '02', title: 'Open or join a room', desc: 'Browse public rooms or create your own study space.' },
  { step: '03', title: 'Start the timer & focus', desc: 'Hit Start, silence distractions, and get things done together.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">Mately</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-6 py-28 text-center">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            🎓 Built for focused, collaborative studying
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Study together.<br />
            <span className="text-indigo-200">Achieve more.</span>
          </h1>

          <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
            Mately gives you real-time study rooms with a shared timer, live chat, and session tracking —
            so you and your study group stay in sync and on track.
          </p>

          <LandingCTA />

          <p className="text-xs text-indigo-300 mt-2">No credit card · Works in any browser · Free forever</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to study smarter</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            All the tools your study group needs, none of the bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Up and running in 60 seconds</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24 text-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-4xl font-extrabold text-white">Ready to focus?</h2>
          <p className="text-indigo-100">Join your first study room in under a minute.</p>
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-indigo-600">Mately</span>
          <span>© {new Date().getFullYear()} Mately. Built with Next.js + Socket.io.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-gray-700 transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
