import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Package, Truck, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Reliable Delivery <span className="text-primary">For Everyone</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with trusted drivers for fast, secure deliveries. Track your packages in real-time
          and enjoy seamless delivery experience.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Easy Ordering</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create delivery orders in seconds with our simple form
          </p>
        </div>
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Real-time Tracking</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your delivery driver live on the map
          </p>
        </div>
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Secure & Reliable</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified drivers and secure COD handling
          </p>
        </div>
      </section>
    </div>
  )
}
