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
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterVendorForm() {
  const registerMutation = useRegisterMutation('vendor')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
      const { confirmPassword, businessName, businessAddress, ...payload } = data
      await registerMutation.mutateAsync({ ...payload, name: data.name })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Registration failed')
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
        Registration submitted! Your account is under verification. You will be able to log in once approved.
        Redirecting to login...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <FormItem>
        <Label htmlFor="name">Contact Person Name</Label>
        <Input id="name" placeholder="John Doe" {...register('name')} />
        {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" placeholder="My Store" {...register('businessName')} />
        {errors.businessName && <FormMessage>{errors.businessName.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="businessAddress">Business Address</Label>
        <Input id="businessAddress" placeholder="123 Main St, City" {...register('businessAddress')} />
        {errors.businessAddress && <FormMessage>{errors.businessAddress.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="03123456789" {...register('phone')} />
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" placeholder="vendor@example.com" {...register('email')} />
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
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Submitting...' : 'Register as Vendor'}
      </Button>
    </form>
  )
}
