import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, Lock, LogIn } from 'lucide-react'

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setLoading(true)
    try {
      const response = await login(data)
      const dashboardMap: Record<string, string> = {
        CUSTOMER: '/dashboard',
        NORMAL_USER: '/dashboard',
        VENDOR: '/dashboard',
        DRIVER: '/dashboard',
        DISPATCH: '/dashboard',
        ADMIN: '/admin/dashboard',
      }
      navigate(from || dashboardMap[response.user.role] || '/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Invalid phone or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="03123456789"
            className="pl-9"
            {...register('phone')}
          />
        </div>
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>

      <FormItem>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            {...register('password')}
          />
        </div>
        {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
      </FormItem>

      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn className="mr-2 h-4 w-4" />
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
