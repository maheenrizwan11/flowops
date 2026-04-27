import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApiPolling } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { timeAgo } from '../../lib/time'
import type { Notification } from '../../types/api'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data, refetch } = useApiPolling<Notification[]>('/notifications', 30_000)
  const unread = (data ?? []).filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  async function markAll() {
    try { await api.patch('/notifications/read-all'); refetch() }
    catch (e) { toast.error(apiError(e)) }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">Notifications</span>
            {unread > 0 && (
              <button className="text-xs text-slate-600 underline" onClick={markAll}>Mark all read</button>
            )}
          </div>
          <ul className="max-h-80 overflow-auto">
            {(data ?? []).slice(0, 10).map((n) => (
              <li key={n.id} className={`border-b px-3 py-2 text-sm ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>
                <p>{n.message}</p>
                <p className="text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </li>
            ))}
            {!(data ?? []).length && <li className="p-4 text-center text-sm text-slate-500">No notifications.</li>}
          </ul>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t px-3 py-2 text-center text-xs text-slate-700 hover:bg-slate-50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  )
}
