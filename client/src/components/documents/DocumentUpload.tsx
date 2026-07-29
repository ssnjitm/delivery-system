import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { Upload, File } from 'lucide-react'
import { useUploadDocument } from '@/hooks/queries/useDocumentQueries'

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const uploadMutation = useUploadDocument()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await uploadMutation.mutateAsync(formData)
      setFile(null)
    } catch {
      setError('Upload failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormItem>
        <Label htmlFor="document">Upload Document</Label>
        <div className="flex items-center gap-2">
          <input
            id="document"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('document')?.click()}
            className="w-full"
          >
            <File className="mr-2 h-4 w-4" />
            {file ? file.name : 'Choose File'}
          </Button>
        </div>
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
      {file && (
        <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      )}
    </form>
  )
}
