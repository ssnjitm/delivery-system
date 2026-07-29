import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterCustomerForm() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      await login({ phone: payload.phone, password: payload.password })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <FormItem>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" {...register('name')} />
        {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="03123456789" {...register('phone')} />
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
        {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
        {errors.confirmPassword && <FormMessage>{errors.confirmPassword.message}</FormMessage>}
      </FormItem>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
