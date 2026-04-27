import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, FileText, Users, Settings, ClipboardList, ShieldCheck, History } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Sidebar() {
  const { currentOrg } = useAuth()
  if (!currentOrg) return null
  const orgId = currentOrg.organization.id
  const role = currentOrg.role

  const link = ({ isActive }: { isActive: boolean }) =>
    cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm',
      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100')

  return (
    <nav className="flex w-60 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-3">
      {role === 'REQUESTER' && (
        <>
          <NavLink to={`/orgs/${orgId}/dashboard`} className={link}><LayoutDashboard size={16}/>Dashboard</NavLink>
          <NavLink to={`/orgs/${orgId}/requests/drafts`} className={link}><FileText size={16}/>My drafts</NavLink>
          <NavLink to={`/orgs/${orgId}/requests/new`} className={link}><FileText size={16}/>New request</NavLink>
        </>
      )}
      {(role === 'REVIEWER' || role === 'ADMIN') && (
        <>
          <NavLink to={`/orgs/${orgId}/reviewer/dashboard`} className={link}><LayoutDashboard size={16}/>Reviewer</NavLink>
          <NavLink to={`/orgs/${orgId}/reviewer/queue`} className={link}><ClipboardList size={16}/>Queue</NavLink>
        </>
      )}
      {role === 'ADMIN' && (
        <>
          <div className="mt-3 px-3 text-xs font-semibold uppercase text-slate-400">Admin</div>
          <NavLink to={`/orgs/${orgId}/admin/dashboard`} className={link}><ShieldCheck size={16}/>Overview</NavLink>
          <NavLink to={`/orgs/${orgId}/admin/members`} className={link}><Users size={16}/>Members</NavLink>
          <NavLink to={`/orgs/${orgId}/admin/settings`} className={link}><Settings size={16}/>Settings</NavLink>
          <NavLink to={`/orgs/${orgId}/admin/audit`} className={link}><History size={16}/>Audit</NavLink>
        </>
      )}
    </nav>
  )
}