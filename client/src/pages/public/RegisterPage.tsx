import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Store, Truck, ArrowRight, ShieldCheck } from 'lucide-react'

const roles = [
  {
    to: '/register/customer',
    icon: User,
    title: 'Customer / Individual',
    desc: 'Send packages, book deliveries and track in real-time.',
    color: 'from-brand-500 to-brand-600',
  },
  {
    to: '/register/vendor',
    icon: Store,
    title: 'Vendor / Business',
    desc: 'Dispatch store orders to customers seamlessly.',
    color: 'from-amber-500 to-brand-600',
  },
  {
    to: '/register/driver',
    icon: Truck,
    title: 'Driver',
    desc: 'Deliver packages and earn on every trip.',
    color: 'from-emerald-500 to-teal-500',
  },
]

export default function RegisterPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden py-12 px-4">
      <div className="bg-brand-glow absolute inset-0 -z-10" />
      <div className="mx-auto w-full max-w-lg animate-slide-up">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Get started
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Choose how you want to use the FastDrop platform</p>
        </div>

        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">I am a...</CardTitle>
            <CardDescription>Select the account type that matches how you'll use FastDrop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => (
              <Link
                key={role.to}
                to={role.to}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${role.color}`}
                >
                  <role.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold">{role.title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{role.desc}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            ))}

            <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-secondary/50 px-4 py-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              All accounts are secure and document-verified
            </div>

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}