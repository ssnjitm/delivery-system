import { FileText, File } from 'lucide-react'

interface FilePreviewProps {
  url: string
  fileName?: string
  className?: string
}

export function FilePreview({ url, fileName, className }: FilePreviewProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)

  if (isImage) {
    return (
      <div className={className}>
        <img
          src={url}
          alt={fileName || 'Preview'}
          className="max-h-48 rounded-md object-cover"
        />
        {fileName && <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>}
      </div>
    )
  }

  const Icon = /\.pdf$/i.test(url) ? FileText : File

  return (
    <div className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors"
      >
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{fileName || 'View Document'}</span>
      </a>
    </div>
  )
}
