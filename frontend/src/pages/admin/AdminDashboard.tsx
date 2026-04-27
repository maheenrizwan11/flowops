import { useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'

interface AdminDashData { memberCount: number; requestsByStatus: Record<string, number> }

export function AdminDashboard() {
  const { orgId } = useParams()
  const { data, loading } = useApi<AdminDashData>(orgId ? `/orgs/${orgId}/dashboard/admin` : null)
  if (loading) return <Skeleton className="h-40" />

  const counts = data?.requestsByStatus ?? {}
  const total = Object.values(counts).reduce((a, b) => a + Number(b), 0) || 1
  const open = (counts.SUBMITTED ?? 0) + (counts.UNDER_REVIEW ?? 0) + (counts.ESCALATED ?? 0)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardBody><div className="text-sm text-slate-500">Members</div><div className="text-3xl font-semibold">{data?.memberCount ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-sm text-slate-500">Total requests</div><div className="text-3xl font-semibold">{total}</div></CardBody></Card>
        <Card><CardBody><div className="text-sm text-slate-500">Open</div><div className="text-3xl font-semibold">{open}</div></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-medium">Requests by status</h2></CardHeader>
        <CardBody>
          <div className="space-y-2">
            {Object.entries(counts).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span>{k}</span><span>{v}</span></div>
                <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-slate-700" style={{ width: `${(Number(v) / total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
