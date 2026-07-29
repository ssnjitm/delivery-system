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
  businessName: z.string().min(2, 'Business name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  address: z.string().min(4, 'Address is required'),
  longitude: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180, 'Valid longitude required'),
  latitude: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90, 'Valid latitude required'),
  citizenshipDocUrl: z.string().url('Enter a valid document URL'),
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
      const { confirmPassword: _cp, longitude, latitude, ...rest } = data; void _cp
      await registerMutation.mutateAsync({
        ...rest,
        role: 'VENDOR' as const,
        coordinates: [Number(longitude), Number(latitude)],
      })
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
        Registration submitted! Your account is under verification. Redirecting to login...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <FormItem>
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" placeholder="Spice House" {...register('businessName')} />
        {errors.businessName && <FormMessage>{errors.businessName.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="ownerName">Owner Name</Label>
        <Input id="ownerName" placeholder="Ram Bahadur" {...register('ownerName')} />
        {errors.ownerName && <FormMessage>{errors.ownerName.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="address">Business Address</Label>
        <Input id="address" placeholder="Thamel, Kathmandu" {...register('address')} />
        {errors.address && <FormMessage>{errors.address.message}</FormMessage>}
      </FormItem>
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" placeholder="85.3133" {...register('longitude')} />
          {errors.longitude && <FormMessage>{errors.longitude.message}</FormMessage>}
        </FormItem>
        <FormItem>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" placeholder="27.7172" {...register('latitude')} />
          {errors.latitude && <FormMessage>{errors.latitude.message}</FormMessage>}
        </FormItem>
      </div>
      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+9779800000000" {...register('phone')} />
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="citizenshipDocUrl">Citizenship Document URL</Label>
        <Input id="citizenshipDocUrl" placeholder="https://cdn.example.com/docs/citizenship.jpg" {...register('citizenshipDocUrl')} />
        {errors.citizenshipDocUrl && <FormMessage>{errors.citizenshipDocUrl.message}</FormMessage>}
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
