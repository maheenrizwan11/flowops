import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, apiError } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = 'Required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Required'
    return e
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    const v = validate(); setErrors(v)
    if (Object.keys(v).length) return
    setSubmitting(true)
    try {
      const res = await api.post<{ token: string }>('/auth/login', { email, password })
      await login(res.token)
      toast.success('Welcome back!')
      nav('/')
    } catch (e) { toast.error(apiError(e)) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4">
          <h1 className="text-xl font-semibold">Sign in to FlowOps</h1>
          <form className="space-y-3" onSubmit={onSubmit} noValidate>
            <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
            <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
            <Button type="submit" loading={submitting} className="w-full">Sign in</Button>
          </form>
          <p className="text-center text-sm text-slate-600">
            No account? <Link to="/register" className="font-medium underline">Register</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
