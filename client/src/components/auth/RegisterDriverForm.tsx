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
  fullName: z.string().min(2, 'Full name is required'),
  bikeModel: z.string().min(1, 'Bike model is required'),
  citizenshipDocUrl: z.string().url('Enter a valid URL'),
  drivingLicenseUrl: z.string().url('Enter a valid URL'),
  bluebookUrl: z.string().url('Enter a valid URL'),
  selfieUrl: z.string().url('Enter a valid URL'),
  emergencyName: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Enter valid emergency phone'),
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
      const { confirmPassword: _cp, emergencyName, emergencyPhone, ...rest } = data; void _cp
      await registerMutation.mutateAsync({
        ...rest,
        role: 'DRIVER' as const,
        emergencyContact: { name: emergencyName, phone: emergencyPhone },
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
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="Sagar Tamang" {...register('fullName')} />
        {errors.fullName && <FormMessage>{errors.fullName.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+9779800000000" {...register('phone')} />
        {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="bikeModel">Bike Model</Label>
        <Input id="bikeModel" placeholder="Honda CB 150R" {...register('bikeModel')} />
        {errors.bikeModel && <FormMessage>{errors.bikeModel.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="citizenshipDocUrl">Citizenship Document URL</Label>
        <Input id="citizenshipDocUrl" placeholder="https://cdn.example.com/docs/citizenship.jpg" {...register('citizenshipDocUrl')} />
        {errors.citizenshipDocUrl && <FormMessage>{errors.citizenshipDocUrl.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="drivingLicenseUrl">Driving License URL</Label>
        <Input id="drivingLicenseUrl" placeholder="https://cdn.example.com/docs/license.jpg" {...register('drivingLicenseUrl')} />
        {errors.drivingLicenseUrl && <FormMessage>{errors.drivingLicenseUrl.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="bluebookUrl">Bluebook URL</Label>
        <Input id="bluebookUrl" placeholder="https://cdn.example.com/docs/bluebook.jpg" {...register('bluebookUrl')} />
        {errors.bluebookUrl && <FormMessage>{errors.bluebookUrl.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="selfieUrl">Selfie URL</Label>
        <Input id="selfieUrl" placeholder="https://cdn.example.com/photos/selfie.jpg" {...register('selfieUrl')} />
        {errors.selfieUrl && <FormMessage>{errors.selfieUrl.message}</FormMessage>}
      </FormItem>
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label htmlFor="emergencyName">Emergency Contact Name</Label>
          <Input id="emergencyName" placeholder="Bishnu Tamang" {...register('emergencyName')} />
          {errors.emergencyName && <FormMessage>{errors.emergencyName.message}</FormMessage>}
        </FormItem>
        <FormItem>
          <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
          <Input id="emergencyPhone" placeholder="+9779800000001" {...register('emergencyPhone')} />
          {errors.emergencyPhone && <FormMessage>{errors.emergencyPhone.message}</FormMessage>}
        </FormItem>
      </div>
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
