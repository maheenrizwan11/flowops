import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { timeAgo } from '../../lib/time'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import type { Notification } from '../../types/api'

export function NotificationsPage() {
  const { data, loading, refetch } = useApi<Notification[]>('/notifications')
  const unread = (data ?? []).filter((n) => !n.read).length

  async function markRead(id: string) {
    try { await api.patch(`/notifications/${id}/read`); refetch() }
    catch (e) { toast.error(apiError(e)) }
  }
  async function markAll() {
    try { await api.patch('/notifications/read-all'); refetch() }
    catch (e) { toast.error(apiError(e)) }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Notifications</h1>
        {unread > 0 && <Button variant="secondary" size="sm" onClick={markAll}>Mark all read</Button>}
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40" />}
        {!loading && (data?.length ?? 0) === 0 && <EmptyState title="You're all caught up" />}
        <ul className="divide-y divide-slate-200">
          {data?.map((n) => (
            <li key={n.id} className={`py-3 text-sm ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p>{n.message}</p>
                  <p className="text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
