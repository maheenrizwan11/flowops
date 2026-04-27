import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute() {
  const { token, loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading…</div>
  if (!token || !user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}