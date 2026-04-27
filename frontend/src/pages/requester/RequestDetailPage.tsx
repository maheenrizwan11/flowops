import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { StatusTimeline } from '../../components/requests/StatusTimeline'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import type { RequestItem, StatusHistoryItem } from '../../types/api'

type DetailResp = RequestItem & { statusHistory: StatusHistoryItem[] }

export function RequestDetailPage() {
  const { orgId, id } = useParams()
  const { data, loading } = useApi<DetailResp>(orgId && id ? `/orgs/${orgId}/requests/${id}` : null)
  if (loading || !data) return <Skeleton className="h-40" />

  return (
    <div className="grid max-w-4xl gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">{data.title}</h1>
            <p className="text-xs text-slate-500">{data.category}</p>
          </div>
          <StatusBadge status={data.status} />
        </CardHeader>
        <CardBody>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{data.description}</p>
          {data.status === 'DRAFT' && (
            <div className="mt-4">
              <Link to={`/orgs/${orgId}/requests/${data.id}/edit`}><Button variant="secondary">Edit draft</Button></Link>
            </div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="font-medium">Timeline</h2></CardHeader>
        <CardBody><StatusTimeline history={data.statusHistory} /></CardBody>
      </Card>
    </div>
  )
}
