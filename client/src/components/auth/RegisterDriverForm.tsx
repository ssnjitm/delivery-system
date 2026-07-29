import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRegisterMutation } from '@/hooks/queries/useAuthQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { FormItem, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VEHICLE_TYPES } from '@/lib/constants'

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleNumber: z.string().min(2, 'Vehicle number is required'),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterDriverForm() {
  const registerMutation = useRegisterMutation('driver')
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
      const { confirmPassword, ...payload } = data
      await registerMutation.mutateAsync(payload)
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
        <Input id="email" type="email" placeholder="driver@example.com" {...register('email')} />
        {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="vehicleType">Vehicle Type</Label>
        <Select
          id="vehicleType"
          options={VEHICLE_TYPES.map((v) => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() }))}
          placeholder="Select vehicle type"
          {...register('vehicleType')}
        />
        {errors.vehicleType && <FormMessage>{errors.vehicleType.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
        <Input id="vehicleNumber" placeholder="ABC-1234" {...register('vehicleNumber')} />
        {errors.vehicleNumber && <FormMessage>{errors.vehicleNumber.message}</FormMessage>}
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
        {registerMutation.isPending ? 'Submitting...' : 'Register as Driver'}
      </Button>
    </form>
  )
}
