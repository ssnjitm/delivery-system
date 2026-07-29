import { Link } from 'react-router-dom'
import { RegisterDriverForm } from '@/components/auth/RegisterDriverForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterDriverPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Driver Registration</CardTitle>
          <CardDescription>Start earning by delivering packages</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterDriverForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
