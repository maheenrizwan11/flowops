const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  payload: any
  constructor(status: number, payload: any, message: string) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const token = localStorage.getItem('flowops_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${baseURL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload: any = null
  const text = await res.text()
  if (text) { try { payload = JSON.parse(text) } catch { payload = text } }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('flowops_token')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') window.location.href = '/login'
    }
    throw new ApiError(res.status, payload, apiErrorMessage(payload) || `Request failed (${res.status})`)
  }
  return payload as T
}

function apiErrorMessage(payload: any): string | null {
  if (!payload) return null
  if (typeof payload === 'string') return payload
  if (typeof payload.error === 'string') return payload.error
  // Zod errors from backend look like: { error: { formErrors: [...], fieldErrors: {...} } }
  const fe = payload?.error?.formErrors?.[0]
  if (fe) return fe
  const fields = payload?.error?.fieldErrors
  if (fields && typeof fields === 'object') {
    const firstKey = Object.keys(fields)[0]
    if (firstKey && Array.isArray(fields[firstKey]) && fields[firstKey][0]) return `${firstKey}: ${fields[firstKey][0]}`
  }
  return null
}

export const api = {
  get:    <T = any>(path: string)            => request<T>('GET',    path),
  post:   <T = any>(path: string, body?: any) => request<T>('POST',   path, body ?? {}),
  patch:  <T = any>(path: string, body?: any) => request<T>('PATCH',  path, body ?? {}),
  delete: <T = any>(path: string)            => request<T>('DELETE', path),
}

export function apiError(e: any): string {
  if (e instanceof ApiError) return e.message
  return e?.message || 'Something went wrong'
}