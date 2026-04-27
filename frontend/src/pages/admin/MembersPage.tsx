import { useState, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import type { MemberRow, Role } from '../../types/api'

export function MembersPage() {
  const { orgId } = useParams()
  const { data, loading, refetch } = useApi<MemberRow[]>(orgId ? `/orgs/${orgId}/members` : null)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('REQUESTER')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)

  async function add(ev: FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = 'Required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email'
    setErrors(e); if (Object.keys(e).length) return
    setAdding(true)
    try {
      await api.post(`/orgs/${orgId}/members`, { email, role })
      toast.success('Member added')
      setEmail(''); setRole('REQUESTER')
      refetch()
    } catch (err) { toast.error(apiError(err)) }
    finally { setAdding(false) }
  }

  async function changeRole(userId: string, newRole: Role) {
    try { await api.patch(`/orgs/${orgId}/members/${userId}`, { role: newRole }); toast.success('Role updated'); refetch() }
    catch (e) { toast.error(apiError(e)) }
  }
  async function remove(userId: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return
    try { await api.delete(`/orgs/${orgId}/members/${userId}`); toast.success('Member removed'); refetch() }
    catch (e) { toast.error(apiError(e)) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h2 className="font-medium">Add member</h2></CardHeader>
        <CardBody>
          <form className="flex flex-wrap items-end gap-3" onSubmit={add} noValidate>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} className="w-72" />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-44">
              <option value="REQUESTER">REQUESTER</option>
              <option value="REVIEWER">REVIEWER</option>
            </Select>
            <Button type="submit" loading={adding}>Add</Button>
          </form>
          <p className="mt-2 text-xs text-slate-500">User must already have a FlowOps account.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="font-medium">Members</h2></CardHeader>
        <CardBody>
          {loading && <Skeleton className="h-40" />}
          <ul className="divide-y divide-slate-200">
            {data?.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{m.user.name}</div>
                  <div className="text-xs text-slate-500">{m.user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={m.role} onChange={(e) => changeRole(m.user.id, e.target.value as Role)} className="w-36">
                    <option value="REQUESTER">REQUESTER</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                  <Button variant="danger" size="sm" onClick={() => remove(m.user.id, m.user.name)}>Remove</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
