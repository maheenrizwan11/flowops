import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import type { RequestItem } from '../../types/api'

// Backend returns { assignedToMe, pendingReview } — confirmed against src/controllers/dashboard.controller.ts
interface ReviewerDashData { assignedToMe: RequestItem[]; pendingReview: RequestItem[] }

export function ReviewerDashboard() {
  const { orgId } = useParams()
  const { data, loading } = useApi<ReviewerDashData>(orgId ? `/orgs/${orgId}/dashboard/reviewer` : null)

  if (loading) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32"/><Skeleton className="h-32"/></div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reviewer dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardBody><div className="text-sm text-slate-500">Assigned to me</div><div className="text-3xl font-semibold">{data?.assignedToMe?.length ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-sm text-slate-500">Pending in queue</div><div className="text-3xl font-semibold">{data?.pendingReview?.length ?? 0}</div></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-medium">Assigned to me</h2></CardHeader>
        <CardBody>
          <ul className="divide-y divide-slate-200">
            {(data?.assignedToMe ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <Link to={`/orgs/${orgId}/reviewer/requests/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                  <div className="text-xs text-slate-500">{r.category}</div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
            {!(data?.assignedToMe ?? []).length && <li className="py-6 text-center text-sm text-slate-500">Nothing assigned to you yet.</li>}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
