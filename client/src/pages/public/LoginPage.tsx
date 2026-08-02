import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { QuickLogin } from '@/components/auth/QuickLogin'
import type { DemoAccount } from '@/components/auth/QuickLogin'
import { Truck, ShieldCheck, Radar, ArrowLeft } from 'lucide-react'

const demoAccounts = [
  { label: 'Customer', phone: '+9231100001', password: 'Seed123!x', role: 'CUSTOMER' },
  { label: 'Driver', phone: '+9231100004', password: 'Seed123!x', role: 'DRIVER' },
  { label: 'Vendor', phone: '+9231100003', password: 'Seed123!x', role: 'VENDOR' },
  { label: 'Dispatch', phone: '+9231100007', password: 'Seed123!x', role: 'DISPATCH' },
  { label: 'Admin', phone: '+9231100009', password: 'Seed123!x', role: 'ADMIN' },
] as const

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-700 via-brand-600 to-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute right-8 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
            <Truck className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-bold">FastDrop</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Your entire logistics operation, in one place.
          </h2>
          <p className="mt-4 text-white/80">
            Manage orders, track drivers in real-time and run payments from a single,
            beautifully crafted platform.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icon: Radar, text: 'Real-time driver & order tracking' },
              { icon: ShieldCheck, text: 'Bank-grade verified network' },
              { icon: Truck, text: 'Intelligent smart dispatch engine' },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} FastDrop Delivery Platform
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Register
            </Link>
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-4">
            <QuickLogin accounts={demoAccounts as unknown as DemoAccount[]} />
            <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
              Seed the database first from the <code className="rounded bg-secondary px-1 py-0.5 font-mono">server/</code> folder with{' '}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono">npm run seed</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}