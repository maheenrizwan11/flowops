import { useEffect, useState, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

// Backend returns org with members[] inlined — we only use .name here
interface OrgResp { id: string; name: string; slug: string }

export function OrgSettingsPage() {
  const { orgId } = useParams()
  const { data, refetch } = useApi<OrgResp>(orgId ? `/orgs/${orgId}` : null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (data?.name) setName(data.name) }, [data])

  async function save(ev: FormEvent) {
    ev.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try { await api.patch(`/orgs/${orgId}`, { name }); toast.success('Saved'); refetch() }
    catch (e) { toast.error(apiError(e)) }
    finally { setSubmitting(false) }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader><h1 className="text-base font-semibold">Organization settings</h1></CardHeader>
      <CardBody>
        <form className="space-y-3" onSubmit={save} noValidate>
          <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" loading={submitting}>Save</Button>
        </form>
      </CardBody>
    </Card>
  )
}
