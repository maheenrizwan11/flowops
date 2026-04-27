import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const { currentOrg, user } = useAuth()
  if (user && !currentOrg) return <div className="p-8">No organization memberships found.</div>

  return (
    <div className="flex h-full flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          {currentOrg ? <Outlet /> : <Navigate to="/login" replace />}
        </main>
      </div>
    </div>
  )
}