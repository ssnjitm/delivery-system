import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Store, Truck } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Choose how you want to use Delivery System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/register/customer" className="block">
            <Button variant="outline" className="w-full h-auto py-6 flex items-center gap-4 justify-start">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Customer / Individual</div>
                <div className="text-xs text-muted-foreground">Send packages and track deliveries</div>
              </div>
            </Button>
          </Link>
          <Link to="/register/vendor" className="block">
            <Button variant="outline" className="w-full h-auto py-6 flex items-center gap-4 justify-start">
              <div className="rounded-full bg-purple-100 p-3">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Vendor / Business</div>
                <div className="text-xs text-muted-foreground">Deliver orders to your customers</div>
              </div>
            </Button>
          </Link>
          <Link to="/register/driver" className="block">
            <Button variant="outline" className="w-full h-auto py-6 flex items-center gap-4 justify-start">
              <div className="rounded-full bg-green-100 p-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Driver</div>
                <div className="text-xs text-muted-foreground">Deliver packages and earn money</div>
              </div>
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
