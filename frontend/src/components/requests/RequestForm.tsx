import { useState, FormEvent } from 'react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export interface RequestFormValues { title: string; description: string; category: string }

interface Props {
  defaultValues?: Partial<RequestFormValues>
  submitting?: boolean
  onSave: (input: RequestFormValues) => void
  onSubmitDraft?: (input: RequestFormValues) => void
}

export function RequestForm({ defaultValues, submitting, onSave, onSubmitDraft }: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [category, setCategory] = useState(defaultValues?.category ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'Required'
    if (!description.trim()) e.description = 'Required'
    if (!category.trim()) e.category = 'Required'
    return e
  }

  function handle(action: 'save' | 'submit') {
    return (ev: FormEvent) => {
      ev.preventDefault()
      const v = validate()
      setErrors(v)
      if (Object.keys(v).length) return
      const data = { title, description, category }
      if (action === 'save') onSave(data)
      else onSubmitDraft?.(data)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handle('save')} noValidate>
      <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <Input label="Category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}
        error={errors.category} placeholder="e.g. Access, Hardware, Policy" />
      <Textarea label="Description" name="description" rows={6} value={description}
        onChange={(e) => setDescription(e.target.value)} error={errors.description} />
      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>Save draft</Button>
        {onSubmitDraft && (
          <Button type="button" variant="secondary" onClick={handle('submit') as unknown as () => void} disabled={submitting}>
            Save & submit
          </Button>
        )}
      </div>
    </form>
  )
}
