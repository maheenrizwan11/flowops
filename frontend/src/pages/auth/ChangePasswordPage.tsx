import { useState, FormEvent } from 'react'
import toast from 'react-hot-toast'
import { api, apiError } from '../../lib/api'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ChangePasswordPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!current) e.currentPassword = 'Required'
    if (next.length < 8) e.newPassword = 'At least 8 characters'
    setErrors(e); if (Object.keys(e).length) return
    setSubmitting(true)
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next })
      toast.success('Password updated')
      setCurrent(''); setNext('')
    } catch (err) { toast.error(apiError(err)) }
    finally { setSubmitting(false) }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader><h1 className="text-base font-semibold">Change password</h1></CardHeader>
      <CardBody>
        <form className="space-y-3" onSubmit={onSubmit} noValidate>
          <Input label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.currentPassword} />
          <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.newPassword} />
          <Button type="submit" loading={submitting}>Update password</Button>
        </form>
      </CardBody>
    </Card>
  )
}
