import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRegisterMutation } from '@/hooks/queries/useAuthQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const registerSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Enter valid international phone (e.g. +9779800000000)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  selfieUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterCustomerForm() {
  const registerMutation = useRegisterMutation('customer')
  const [error, setError] = useState<string | null>(null)
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
    try {
      const { confirmPassword: _cp, selfieUrl, email, ...rest } = data; void _cp
      await registerMutation.mutateAsync({
        ...rest,
        role: 'CUSTOMER' as const,
        email: email || undefined,
        selfieUrl: selfieUrl || 'https://placehold.co/400',
      })
      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <FormItem>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" {...register('fullName')} />
        {errors.fullName && <FormMessage>{errors.fullName.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+9779800000000" {...register('phone')} />
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
        {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="selfieUrl">Profile Photo URL (optional)</Label>
        <Input id="selfieUrl" placeholder="https://example.com/photo.jpg" {...register('selfieUrl')} />
        {errors.selfieUrl && <FormMessage>{errors.selfieUrl.message}</FormMessage>}
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
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
