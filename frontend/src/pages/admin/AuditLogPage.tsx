import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { timeAgo } from '../../lib/time'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import type { AuditLogItem, RequestItem, StatusHistoryItem } from '../../types/api'

interface AuditResp { auditLogs: AuditLogItem[]; statusHistory: StatusHistoryItem[] }

export function AuditLogPage() {
  const { orgId } = useParams()
  const [selected, setSelected] = useState<string | null>(null)
  const { data: requests } = useApi<RequestItem[]>(orgId ? `/orgs/${orgId}/requests` : null)
  const { data: audit, loading } = useApi<AuditResp>(orgId && selected ? `/orgs/${orgId}/requests/${selected}/audit` : null)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader><h2 className="font-medium">Requests</h2></CardHeader>
        <CardBody>
          <ul className="divide-y divide-slate-200">
            {requests?.map((r) => (
              <li key={r.id}>
                <button onClick={() => setSelected(r.id)} className={`w-full py-2 text-left text-sm ${selected === r.id ? 'font-semibold' : ''}`}>{r.title}</button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><h2 className="font-medium">Audit log</h2></CardHeader>
        <CardBody>
          {!selected && <p className="text-sm text-slate-500">Pick a request to see its audit trail.</p>}
          {selected && loading && <Skeleton className="h-40" />}
          {audit && (
            <ul className="space-y-2 text-sm">
              {audit.auditLogs.map((a) => (
                <li key={a.id} className="rounded border border-slate-200 px-3 py-2">
                  <div className="font-medium">{a.action}</div>
                  <div className="text-xs text-slate-500">by {a.user.name} · {timeAgo(a.createdAt)}</div>
                  {a.metadata && <pre className="mt-1 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(a.metadata, null, 2)}</pre>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
