import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, apiError } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'

export function RegisterPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Required'
    if (!email.trim()) e.email = 'Required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email'
    if (password.length < 8) e.password = 'At least 8 characters'
    return e
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    const v = validate(); setErrors(v)
    if (Object.keys(v).length) return
    setSubmitting(true)
    try {
      const res = await api.post<{ token: string }>('/auth/register', { name, email, password })
      await login(res.token)
      toast.success('Account created!')
      nav('/')
    } catch (e) { toast.error(apiError(e)) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4">
          <h1 className="text-xl font-semibold">Create your FlowOps account</h1>
          <form className="space-y-3" onSubmit={onSubmit} noValidate>
            <Input label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
            <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
            <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
            <Button type="submit" loading={submitting} className="w-full">Create account</Button>
          </form>
          <p className="text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-medium underline">Sign in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
