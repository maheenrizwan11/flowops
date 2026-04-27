import { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { Role } from '../../types/api'

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { currentOrg } = useAuth()
  if (!currentOrg) return <div className="p-8 text-sm text-slate-500">No organization selected.</div>
  if (!allow.includes(currentOrg.role)) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">403 — Forbidden</h1>
        <p className="mt-1 text-sm text-slate-600">You don't have permission to view this page.</p>
      </div>
    )
  }
  return <>{children}</>
}