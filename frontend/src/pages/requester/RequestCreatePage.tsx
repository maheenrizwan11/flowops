import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, apiError } from '../../lib/api'
import { RequestForm, type RequestFormValues } from '../../components/requests/RequestForm'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import type { RequestItem } from '../../types/api'

export function RequestCreatePage() {
  const { orgId } = useParams()
  const nav = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  async function save(input: RequestFormValues) {
    setSubmitting(true)
    try {
      const r = await api.post<RequestItem>(`/orgs/${orgId}/requests`, input)
      toast.success('Draft saved')
      nav(`/orgs/${orgId}/requests/${r.id}/edit`)
    } catch (e) {
      toast.error(apiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function saveAndSubmit(input: RequestFormValues) {
    setSubmitting(true)
    try {
      const r = await api.post<RequestItem>(`/orgs/${orgId}/requests`, input)
      await api.post(`/orgs/${orgId}/requests/${r.id}/submit`)
      toast.success('Request submitted')
      nav(`/orgs/${orgId}/requests/${r.id}`)
    } catch (e) {
      toast.error(apiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><h1 className="text-base font-semibold">New request</h1></CardHeader>
      <CardBody><RequestForm onSave={save} onSubmitDraft={saveAndSubmit} submitting={submitting} /></CardBody>
    </Card>
  )
}
