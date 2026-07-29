import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import type { IUser } from '@/types/user'

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone is required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: IUser
  onSave: (data: Partial<IUser>) => Promise<void>
  isSaving?: boolean
}

export function ProfileForm({ user, onSave, isSaving }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user.name,
      email: user.email || '',
      phone: user.phone,
    },
  })

  return (
    <form onSubmit={form.handleSubmit((data) => onSave(data))} className="space-y-4">
      <FormItem>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && <FormMessage>{form.formState.errors.name.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register('phone')} />
        {form.formState.errors.phone && <FormMessage>{form.formState.errors.phone.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register('email')} />
        {form.formState.errors.email && <FormMessage>{form.formState.errors.email.message}</FormMessage>}
      </FormItem>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
