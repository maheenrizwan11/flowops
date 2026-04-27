import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { LogOut, KeyRound } from 'lucide-react'
import { NotificationBell } from '../notifications/NotificationBell'

export function Topbar() {
  const { user, currentOrg, logout, setCurrentOrg } = useAuth()
  const nav = useNavigate()

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-base font-semibold">FlowOps</Link>
        {user && user.memberships.length > 0 && (
          <select
            value={currentOrg?.id || ''}
            onChange={(e) => {
              const m = user.memberships.find((x) => x.id === e.target.value)
              if (m) { setCurrentOrg(m); nav('/') }
            }}
            className="rounded-md border-slate-300 text-sm">
            {user.memberships.map((m) => (
              <option key={m.id} value={m.id}>{m.organization.name} ({m.role})</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Link to="/settings/password" className="rounded p-2 text-slate-600 hover:bg-slate-100"><KeyRound size={18}/></Link>
        <span className="text-sm text-slate-600">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={() => { logout(); nav('/login') }}>
          <LogOut size={14}/>Sign out
        </Button>
      </div>
    </header>
  )
}