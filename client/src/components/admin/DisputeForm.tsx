import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'

const schema = z.object({
  subject: z.string().min(4, 'Subject is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

interface DisputeFormProps {
  onSubmit: (data: FormData) => Promise<void>
  isSubmitting?: boolean
}

export function DisputeForm({ onSubmit, isSubmitting }: DisputeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <Label>Subject</Label>
        <Input {...form.register('subject')} placeholder="Brief subject" />
        {form.formState.errors.subject && <FormMessage>{form.formState.errors.subject.message}</FormMessage>}
      </FormItem>
      <FormItem>
        <Label>Description</Label>
        <Textarea {...form.register('description')} rows={4} placeholder="Describe the issue in detail..." />
        {form.formState.errors.description && <FormMessage>{form.formState.errors.description.message}</FormMessage>}
      </FormItem>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
      </Button>
    </form>
  )
}
