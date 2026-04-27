import { cn } from '../../lib/cn'
import type { RequestStatus } from '../../types/api'

const map: Record<RequestStatus, { label: string; cls: string }> = {
  DRAFT:        { label: 'Draft',        cls: 'bg-slate-100 text-slate-700' },
  SUBMITTED:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW: { label: 'Under review', cls: 'bg-amber-100 text-amber-800' },
  ESCALATED:    { label: 'Escalated',    cls: 'bg-orange-100 text-orange-800' },
  APPROVED:     { label: 'Approved',     cls: 'bg-green-100 text-green-700' },
  REJECTED:     { label: 'Rejected',     cls: 'bg-red-100 text-red-700' },
  CLOSED:       { label: 'Closed',       cls: 'bg-zinc-100 text-zinc-700' },
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const m = map[status]
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', m.cls)}>{m.label}</span>
}