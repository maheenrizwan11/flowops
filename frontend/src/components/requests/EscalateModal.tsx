import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { api, apiError } from '../../lib/api'
import type { MemberRow } from '../../types/api'

interface Props { open: boolean; onClose: () => void; orgId: string; requestId: string; onDone: () => void }

export function EscalateModal({ open, onClose, orgId, requestId, onDone }: Props) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [assigneeId, setAssigneeId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    api.get<MemberRow[]>(`/orgs/${orgId}/members`)
      .then((rows) => setMembers(rows.filter((m) => m.role === 'REVIEWER' || m.role === 'ADMIN')))
      .catch((e) => toast.error(apiError(e)))
  }, [open, orgId])

  async function submit() {
    if (!assigneeId) { setError('Pick an assignee'); return }
    setError(null); setSubmitting(true)
    try {
      await api.post(`/orgs/${orgId}/requests/${requestId}/escalate`, { assigneeId, reason: reason || undefined })
      toast.success('Escalated')
      setAssigneeId(''); setReason('')
      onDone(); onClose()
    } catch (e) { toast.error(apiError(e)) }
    finally { setSubmitting(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Escalate request"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} loading={submitting}>Escalate</Button>
      </>}>
      <div className="space-y-3">
        <Select label="Assign to" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} error={error || undefined}>
          <option value="">— Pick a reviewer —</option>
          {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.role})</option>)}
        </Select>
        <Textarea label="Reason (optional)" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  )
}
