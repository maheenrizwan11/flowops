import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'
import { api, apiError } from '../../lib/api'
import { RequestForm, type RequestFormValues } from '../../components/requests/RequestForm'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import type { RequestItem, StatusHistoryItem } from '../../types/api'

type DetailResp = RequestItem & { statusHistory: StatusHistoryItem[] }

export function RequestEditPage() {
  const { orgId, id } = useParams()
  const nav = useNavigate()
  const { data, loading } = useApi<DetailResp>(orgId && id ? `/orgs/${orgId}/requests/${id}` : null)
  const [submitting, setSubmitting] = useState(false)

  if (loading || !data) return <Skeleton className="h-40" />
  if (data.status !== 'DRAFT') return <div className="text-sm text-slate-600">This request has already been submitted.</div>

  async function save(input: RequestFormValues) {
    setSubmitting(true)
    try {
      await api.patch(`/orgs/${orgId}/requests/${id}`, input)
      toast.success('Saved')
    } catch (e) {
      toast.error(apiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function saveAndSubmit(input: RequestFormValues) {
    setSubmitting(true)
    try {
      await api.patch(`/orgs/${orgId}/requests/${id}`, input)
      await api.post(`/orgs/${orgId}/requests/${id}/submit`)
      toast.success('Submitted')
      nav(`/orgs/${orgId}/requests/${id}`)
    } catch (e) {
      toast.error(apiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><h1 className="text-base font-semibold">Edit draft</h1></CardHeader>
      <CardBody>
        <RequestForm
          defaultValues={{ title: data.title, description: data.description, category: data.category }}
          onSave={save}
          onSubmitDraft={saveAndSubmit}
          submitting={submitting}
        />
      </CardBody>
    </Card>
  )
}
