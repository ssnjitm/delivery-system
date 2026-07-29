import { useParams, useNavigate } from 'react-router-dom'
import { useAdminUserDetail, useSuspendUser, useActivateUser } from '@/hooks/queries/useAdminQueries'
import { UserDetail } from '@/components/users/UserDetail'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Ban, CheckCircle } from 'lucide-react'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useAdminUserDetail(id!)
  const suspendUser = useSuspendUser()
  const activateUser = useActivateUser()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />
  if (!data?.user) return <ErrorState message="User not found" />

  const user = data.user

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {user.isActive ? (
            <Button variant="destructive" size="sm" onClick={() => suspendUser.mutate(id!)}>
              <Ban className="mr-2 h-4 w-4" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => activateUser.mutate(id!)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>
      <UserDetail user={user} />
    </div>
  )
}
