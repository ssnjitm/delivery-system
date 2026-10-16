import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRegisterMutation } from '@/hooks/queries/useAuthQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { DocumentFileUpload } from '@/components/documents/DocumentFileUpload'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const registerSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Enter valid international phone (e.g. +9779800000000)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  bikeModel: z.string().min(1, 'Bike model is required'),
  citizenshipDocUrl: z.string().min(1, 'Please upload your citizenship document'),
  drivingLicenseUrl: z.string().min(1, 'Please upload your driving license'),
  bluebookUrl: z.string().min(1, 'Please upload your bluebook'),
  selfieUrl: z.string().min(1, 'Please upload a selfie'),
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
    control,
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
      <Controller
        control={control}
        name="citizenshipDocUrl"
        render={({ field }) => (
          <DocumentFileUpload
            label="Citizenship Document"
            type="citizenship"
            value={field.value}
            onChange={field.onChange}
            error={errors.citizenshipDocUrl?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="drivingLicenseUrl"
        render={({ field }) => (
          <DocumentFileUpload
            label="Driving License"
            type="driving_license"
            value={field.value}
            onChange={field.onChange}
            error={errors.drivingLicenseUrl?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="bluebookUrl"
        render={({ field }) => (
          <DocumentFileUpload
            label="Bluebook"
            type="bluebook"
            value={field.value}
            onChange={field.onChange}
            error={errors.bluebookUrl?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="selfieUrl"
        render={({ field }) => (
          <DocumentFileUpload
            label="Selfie"
            type="selfie"
            value={field.value}
            onChange={field.onChange}
            error={errors.selfieUrl?.message}
          />
        )}
      />
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
