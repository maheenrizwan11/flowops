import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { RoleGate } from './components/layout/RoleGate'
import { useAuth } from './contexts/AuthContext'

const Stub = ({ name }: { name: string }) => <div className="text-sm text-slate-500">TODO: {name}</div>

import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'


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
            <Route path="/notifications" element={<Stub name="NotificationsPage" />} />

            <Route path="/orgs/:orgId/dashboard" element={<RoleGate allow={['REQUESTER']}><Stub name="RequesterDashboard"/></RoleGate>} />
            <Route path="/orgs/:orgId/requests/drafts" element={<RoleGate allow={['REQUESTER']}><Stub name="DraftListPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/requests/new" element={<RoleGate allow={['REQUESTER']}><Stub name="RequestCreatePage"/></RoleGate>} />
            <Route path="/orgs/:orgId/requests/:id/edit" element={<RoleGate allow={['REQUESTER']}><Stub name="RequestEditPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/requests/:id" element={<RoleGate allow={['REQUESTER','REVIEWER','ADMIN']}><Stub name="RequestDetailPage"/></RoleGate>} />

            <Route path="/orgs/:orgId/reviewer/dashboard" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="ReviewerDashboard"/></RoleGate>} />
            <Route path="/orgs/:orgId/reviewer/queue" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="ReviewerQueuePage"/></RoleGate>} />
            <Route path="/orgs/:orgId/reviewer/requests/:id" element={<RoleGate allow={['REVIEWER','ADMIN']}><Stub name="RequestReviewPage"/></RoleGate>} />

            <Route path="/orgs/:orgId/admin/dashboard" element={<RoleGate allow={['ADMIN']}><Stub name="AdminDashboard"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/members" element={<RoleGate allow={['ADMIN']}><Stub name="MembersPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/settings" element={<RoleGate allow={['ADMIN']}><Stub name="OrgSettingsPage"/></RoleGate>} />
            <Route path="/orgs/:orgId/admin/audit" element={<RoleGate allow={['ADMIN']}><Stub name="AuditLogPage"/></RoleGate>} />

            <Route path="*" element={<div className="p-6">Not found.</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}