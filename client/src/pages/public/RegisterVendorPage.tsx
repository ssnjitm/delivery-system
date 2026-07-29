import { Link } from 'react-router-dom'
import { RegisterVendorForm } from '@/components/auth/RegisterVendorForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterVendorPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vendor Registration</CardTitle>
          <CardDescription>Register your business for delivery services</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterVendorForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
