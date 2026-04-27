import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { RoleGate } from './components/layout/RoleGate'
import { useAuth } from './contexts/AuthContext'

const Stub = ({ name }: { name: string }) => <div className="text-sm text-slate-500">TODO: {name}</div>

import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { RequesterDashboard } from './pages/requester/RequesterDashboard'
import { DraftListPage } from './pages/requester/DraftListPage'
import { RequestCreatePage } from './pages/requester/RequestCreatePage'
import { RequestEditPage } from './pages/requester/RequestEditPage'
import { RequestDetailPage } from './pages/requester/RequestDetailPage'
import { NotificationsPage } from './pages/shared/NotificationsPage'


function HomeRedirect() {
  const { currentOrg } = useAuth()
  if (!currentOrg) return <Navigate to="/login" replace />
  const orgId = currentOrg.organization.id
  if (currentOrg.role === 'REQUESTER') return <Navigate to={`/orgs/${orgId}/dashboard`} replace />
  if (currentOrg.role === 'REVIEWER') return <Navigate to={`/orgs/${orgId}/reviewer/dashboard`} replace />
  return <Navigate to={`/orgs/${orgId}/admin/dashboard`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/settings/password" element={<Stub name="ChangePasswordPage" />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/orgs/:orgId/dashboard" element={<RoleGate allow={['REQUESTER']}><RequesterDashboard /></RoleGate>} />
            <Route path="/orgs/:orgId/requests/drafts" element={<RoleGate allow={['REQUESTER']}><DraftListPage /></RoleGate>} />
            <Route path="/orgs/:orgId/requests/new" element={<RoleGate allow={['REQUESTER']}><RequestCreatePage /></RoleGate>} />
            <Route path="/orgs/:orgId/requests/:id/edit" element={<RoleGate allow={['REQUESTER']}><RequestEditPage /></RoleGate>} />
            <Route path="/orgs/:orgId/requests/:id" element={<RoleGate allow={['REQUESTER','REVIEWER','ADMIN']}><RequestDetailPage /></RoleGate>} />

            <Route path="/orgs/:orgId/reviewer/dashboard" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="ReviewerDashboard"/></RoleGate>} />
            <Route path="/orgs/:orgId/reviewer/queue" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="ReviewerQueuePage"/></RoleGate>} />
            <Route path="/orgs/:orgId/reviewer/requests/:id" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="RequestReviewPage"/></RoleGate>} />

            <Route path="/orgs/:orgId/admin/dashboard" element={<RoleGate allow={['ADMIN']}><Stub name="AdminDashboard"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/members" element={<RoleGate allow={['ADMIN']}><Stub name="MembersPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/settings" element={<RoleGate allow={['ADMIN']}><Stub name="OrgSettingsPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/audit" element={<RoleGate allow={['ADMIN']}><Stub name="AuditLogPage"/></RoleGate>} />

            <Route path="*" element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-semibold">404</h1>
                <p className="mt-1 text-sm text-slate-500">Page not found.</p>
              </div>
            } />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}