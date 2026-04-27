import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import type { RequestItem } from '../../types/api'

export function DraftListPage() {
  const { orgId } = useParams()
  const nav = useNavigate()
  const { data, loading, refetch } = useApi<RequestItem[]>(orgId ? `/orgs/${orgId}/requests?status=DRAFT` : null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function onDelete(id: string) {
    if (!confirm('Delete this draft? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await api.delete(`/orgs/${orgId}/requests/${id}`)
      toast.success('Draft deleted')
      refetch()
    } catch (e) {
      toast.error(apiError(e))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h1 className="text-base font-semibold">My drafts</h1>
        <Link to={`/orgs/${orgId}/requests/new`}><Button>New draft</Button></Link>
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40" />}
        {!loading && (data?.length ?? 0) === 0 && (
          <EmptyState
            title="No drafts yet"
            description="Create your first request and save it as a draft."
            action={<Button onClick={() => nav(`/orgs/${orgId}/requests/new`)}>New request</Button>}
          />
        )}
        <ul className="divide-y divide-slate-200">
          {data?.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-slate-500">{r.category}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/orgs/${orgId}/requests/${r.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                <Button size="sm" variant="danger" loading={deletingId === r.id} onClick={() => onDelete(r.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
