import { useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { StatusTimeline } from '../../components/requests/StatusTimeline'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../contexts/AuthContext'
import type { RequestItem, StatusHistoryItem } from '../../types/api'

// Backend returns the request object directly with statusHistory inlined — confirmed against
// src/controllers/requests.controller.ts:55 (getRequest)
type DetailResp = RequestItem & { statusHistory: StatusHistoryItem[] }

export function RequestReviewPage() {
  const { orgId, id } = useParams()
  const { user } = useAuth()
  const { data, loading, refetch } = useApi<DetailResp>(orgId && id ? `/orgs/${orgId}/requests/${id}` : null)
  const [busy, setBusy] = useState<'start' | 'approve' | 'reject' | null>(null)
  const [escalateOpen, setEscalateOpen] = useState(false)

  async function action(kind: 'start' | 'approve' | 'reject', successMsg: string) {
    setBusy(kind)
    try {
      await api.post(`/orgs/${orgId}/requests/${id}/review/${kind}`)
      toast.success(successMsg)
      refetch()
    } catch (e) { toast.error(apiError(e)) }
    finally { setBusy(null) }
  }

  if (loading || !data) return <Skeleton className="h-40" />
  const mine = data.assignedToId === user?.id

  return (
    <div className="grid max-w-5xl gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">{data.title}</h1>
            <p className="text-xs text-slate-500">{data.category} · by {data.createdBy?.name}</p>
          </div>
          <StatusBadge status={data.status} />
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-slate-800">{data.description}</p>
          <div className="flex flex-wrap gap-2">
            {data.status === 'SUBMITTED' && (
              <Button onClick={() => action('start', 'Review started')} loading={busy === 'start'}>Start review</Button>
            )}
            {data.status === 'UNDER_REVIEW' && mine && (
              <>
                <Button onClick={() => { if (confirm('Approve this request?')) action('approve', 'Approved') }} loading={busy === 'approve'}>Approve</Button>
                <Button variant="danger" onClick={() => { if (confirm('Reject this request?')) action('reject', 'Rejected') }} loading={busy === 'reject'}>Reject</Button>
                <Button variant="secondary" onClick={() => setEscalateOpen(true)}>Escalate</Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="font-medium">Timeline</h2></CardHeader>
        <CardBody><StatusTimeline history={data.statusHistory ?? []} /></CardBody>
      </Card>
      {/* EscalateModal wired in M4 */}
    </div>
  )
}
