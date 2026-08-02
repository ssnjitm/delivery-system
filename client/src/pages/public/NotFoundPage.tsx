import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Truck, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-brand-glow absolute inset-0 -z-10" />
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand animate-float">
        <Truck className="h-10 w-10" />
      </div>
      <div>
        <p className="text-gradient font-heading text-7xl font-extrabold sm:text-8xl">404</p>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          This route doesn't exist
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          The page you're looking for was moved, deleted, or never made it onto the map.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/">
          <Button variant="gradient" size="lg">
            <Home className="mr-1 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button variant="outline" size="lg" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  )
}