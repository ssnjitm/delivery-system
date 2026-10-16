import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { File, Upload, Check } from 'lucide-react'
import { useUploadPublicDocument } from '@/hooks/queries/useDocumentQueries'

export type RegistrationDocumentType =
  | 'citizenship'
  | 'driving_license'
  | 'bluebook'
  | 'selfie'
  | 'business_logo'
  | 'business_photo'
  | 'profile_photo'

interface DocumentFileUploadProps {
  label: string
  type: RegistrationDocumentType
  value?: string
  onChange: (url: string) => void
  error?: string
}

export function DocumentFileUpload({
  label,
  type,
  value,
  onChange,
  error,
}: DocumentFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const uploadMutation = useUploadPublicDocument()

  const handleSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setLocalError(null)
    try {
      const result = await uploadMutation.mutateAsync({ file, type })
      onChange(result.url)
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setLocalError(axiosError?.response?.data?.message || 'Upload failed')
    }
  }

  const message = localError || error

  return (
    <FormItem>
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleSelect}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadMutation.isPending ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Uploading...
          </>
        ) : value ? (
          <>
            <Check className="mr-2 h-4 w-4 text-emerald-600" />
            Uploaded — choose a different file
          </>
        ) : (
          <>
            <File className="mr-2 h-4 w-4" />
            Choose file
          </>
        )}
      </Button>
      {value && <p className="truncate text-xs text-muted-foreground">{value}</p>}
      {message && <FormMessage>{message}</FormMessage>}
    </FormItem>
  )
}
