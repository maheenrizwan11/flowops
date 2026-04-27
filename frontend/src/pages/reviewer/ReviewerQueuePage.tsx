import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import type { RequestItem, RequestStatus } from '../../types/api'

const FILTERS: (RequestStatus | 'ALL')[] = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ESCALATED', 'APPROVED', 'REJECTED']

export function ReviewerQueuePage() {
  const { orgId } = useParams()
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('SUBMITTED')
  const path = orgId ? `/orgs/${orgId}/requests${filter === 'ALL' ? '' : `?status=${filter}`}` : null
  const { data, loading } = useApi<RequestItem[]>(path)

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Review queue</h1>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="w-44">
          {FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40" />}
        {!loading && (data?.length ?? 0) === 0 && <EmptyState title="Nothing in queue" />}
        <ul className="divide-y divide-slate-200">
          {data?.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div>
                <Link to={`/orgs/${orgId}/reviewer/requests/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                <div className="text-xs text-slate-500">{r.category} · by {r.createdBy?.name}</div>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
