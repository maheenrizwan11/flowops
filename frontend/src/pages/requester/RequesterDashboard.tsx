import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import type { RequestItem } from '../../types/api'

interface RequesterDashData {
  draft: RequestItem[]
  submitted: RequestItem[]
  closed: RequestItem[]
}

export function RequesterDashboard() {
  const { orgId } = useParams()
  const { data, loading } = useApi<RequesterDashData>(orgId ? `/orgs/${orgId}/dashboard/requester` : null)
  if (loading) return <Skeleton className="h-40" />

  const recent = [...(data?.draft ?? []), ...(data?.submitted ?? []), ...(data?.closed ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My dashboard</h1>
        <Link to={`/orgs/${orgId}/requests/new`}><Button>New request</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardBody><div className="text-sm text-slate-500">Drafts</div><div className="text-3xl font-semibold">{data?.draft?.length ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-sm text-slate-500">Submitted</div><div className="text-3xl font-semibold">{data?.submitted?.length ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-sm text-slate-500">Closed</div><div className="text-3xl font-semibold">{data?.closed?.length ?? 0}</div></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-medium">Recent activity</h2></CardHeader>
        <CardBody>
          <ul className="divide-y divide-slate-200">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <Link to={`/orgs/${orgId}/requests/${r.id}`} className="hover:underline">{r.title}</Link>
                <StatusBadge status={r.status} />
              </li>
            ))}
            {!recent.length && <li className="py-6 text-center text-sm text-slate-500">No requests yet.</li>}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
