import { Outlet, Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Package className="h-5 w-5 text-primary" />
            Delivery System
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Delivery System. All rights reserved.
      </footer>
    </div>
  )
}
