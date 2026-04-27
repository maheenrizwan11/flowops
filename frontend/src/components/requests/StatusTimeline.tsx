import { timeAgo } from '../../lib/time'
import { StatusBadge } from '../ui/Badge'
import type { StatusHistoryItem } from '../../types/api'

export function StatusTimeline({ history }: { history: StatusHistoryItem[] }) {
  if (!history.length) return <p className="text-sm text-slate-500">No status changes yet.</p>
  return (
    <ol className="space-y-3">
      {history.map((h) => (
        <li key={h.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={h.toStatus} />
              <span className="text-xs text-slate-500">by {h.changedBy.name} · {timeAgo(h.changedAt)}</span>
            </div>
            {h.note && <p className="mt-1 text-sm text-slate-700">{h.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
