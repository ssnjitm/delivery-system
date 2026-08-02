import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Truck,
  Shield,
  Zap,
  MapPin,
  Radar,
  ArrowRight,
  Star,
  Clock,
  Smartphone,
  Globe,
  Wallet,
  CircleCheck,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Dispatch',
    desc: 'Smart driver matching routes your order in seconds to the closest available rider.',
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/15',
  },
  {
    icon: Radar,
    title: 'Real-time Tracking',
    desc: 'Live map with precise driver location, ETA and touchpoint updates from pickup to drop.',
    color: 'text-brand-600 bg-brand-soft dark:bg-brand-500/15',
  },
  {
    icon: Shield,
    title: 'Verified Network',
    desc: 'Every driver and vendor is document-verified with ratings, escrow and dispute resolution.',
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15',
  },
  {
    icon: Wallet,
    title: 'Transparent Pricing',
    desc: 'Distance-based zone pricing with a clear breakdown — no surge surprises, ever.',
    color: 'text-sky-600 bg-sky-100 dark:bg-sky-500/15',
  },
]

const steps = [
  { icon: Package, title: 'Create your order', desc: 'Describe pickup, drop and package type in under a minute.' },
  { icon: Radar, title: 'Get matched', desc: 'Our dispatch engine assigns the nearest verified driver.' },
  { icon: CircleCheck, title: 'Track & confirm', desc: 'Follow the live map and confirm safe delivery with signature.' },
]

const stats = [
  { value: '99.2%', label: 'On-time delivery' },
  { value: '4.8★', label: 'Average rating' },
  { value: '50k+', label: 'Deliveries completed' },
  { value: '120+', label: 'Cities covered' },
]

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* ── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-60" />
        <div className="bg-brand-glow absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-slide-up">
              <Badge variant="soft" className="mb-6 px-3 py-1.5 text-xs">
                <Truck className="mr-1.5 h-3.5 w-3.5" />
                The premium delivery platform
              </Badge>
            </div>
            <h1 className="animate-slide-up font-heading text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: '60ms' }}>
              Deliver anything,
              <br />
              <span className="text-gradient">anywhere. Flawlessly.</span>
            </h1>
            <p
              className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              style={{ animationDelay: '120ms' }}
            >
              FastDrop connects customers, vendors and verified drivers on one intelligent
              platform — with real-time tracking, transparent pricing and trustworthy dispatch.
            </p>
            <div
              className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: '180ms' }}
            >
              <Link to="/register">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>

            <div
              className="animate-slide-up mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
              style={{ animationDelay: '240ms' }}
            >
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
                  <p className="font-heading text-2xl font-bold text-gradient">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Why FastDrop
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              A logistics system built like an operating system
            </h2>
            <p className="mt-4 text-muted-foreground">
              Enterprise-grade control for operators, effortless experience for everyone else.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                How it works
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                From pickup to delivered in three steps
              </h2>
              <div className="mt-10 space-y-8">
                {steps.map((s, i) => (
                  <div key={s.title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand">
                        <s.icon className="h-5 w-5" />
                      </div>
                      {i < steps.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-8">
                      <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
                      <h3 className="mt-1 font-heading text-lg font-bold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery card mock */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-brand-500/10 blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-float animate-float">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading font-bold">Order #FD-7841</p>
                      <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In transit
                      </p>
                    </div>
                  </div>
                  <Badge variant="soft">ETA 12 min</Badge>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">Spice House, Thamel</p>
                    </div>
                  </div>
                  <div className="ml-[17px] h-6 border-l-2 border-dashed border-brand-300" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Drop</p>
                      <p className="text-sm font-medium">Lazimpat, Kathmandu</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Driver · Sagar T.</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" /> 4.9
                    </span>
                  </p>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-brand-500" />
                    <div className="h-2 flex-1 rounded-full bg-brand-500" />
                    <div className="h-2 flex-1 rounded-full bg-brand-500" />
                    <div className="h-2 flex-1 rounded-full bg-brand-400" />
                    <div className="h-2 flex-1 rounded-full bg-border" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES ────────────────────────────── */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Package, title: 'Customers', desc: 'Send anything with live tracking and fair pricing.' },
              { icon: Globe, title: 'Vendors', desc: 'Scale your store deliveries with dedicated dispatch.' },
              { icon: Smartphone, title: 'Drivers', desc: 'Earn on flexible trips with transparent payouts.' },
            ].map((r) => (
              <div key={r.title} className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-brand-600 to-brand-800 px-6 py-16 text-center text-white shadow-float">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-amber-300/20 blur-2xl" />
            <div className="relative">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to move at the speed of trust?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Join thousands of customers, vendors and drivers using FastDrop every single day.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-brand-700 shadow-lg hover:bg-white/90">
                    Create Account
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/15 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────── */}
      <div className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm text-muted-foreground sm:px-6">
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> Fully verified</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-500" /> 24/7 support</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> Top rated drivers</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sky-500" /> City-wide coverage</span>
        </div>
      </div>
    </div>
  )
}