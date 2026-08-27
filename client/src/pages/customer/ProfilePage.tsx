import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '@/hooks/queries/useUserQueries'
import { ProfileForm } from '@/components/users/ProfileForm'
import { DocumentList } from '@/components/documents/DocumentList'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMyDocuments, useDeleteDocument } from '@/hooks/queries/useDocumentQueries'
import type { IUser } from '@/types/user'

export default function CustomerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const { data: documents, refetch } = useMyDocuments()
  const deleteDoc = useDeleteDocument()

  const handleSave = async (data: Parameters<typeof updateProfile.mutateAsync>[0]) => {
    const payload = {
      phone: data.phone,
      fullName: data.name,
      email: data.email,
    }
    await updateProfile.mutateAsync(payload as Parameters<typeof updateProfile.mutateAsync>[0])
  }

  const handleDelete = async (id: string) => {
    await deleteDoc.mutateAsync(id)
    refetch()
  }

  if (!user) return null

  const profileUser = { ...user, _id: user.id, createdAt: '', updatedAt: '' } as IUser

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm user={profileUser} onSave={handleSave} isSaving={updateProfile.isPending} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upload Document</CardTitle></CardHeader>
        <CardContent>
          <DocumentUpload />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Documents</h2>
        <DocumentList documents={documents || []} onDelete={handleDelete} />
      </div>
    </div>
  )
}
