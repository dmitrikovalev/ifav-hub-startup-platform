import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { api } from '../api/client'
import type { TokenResponse } from '../types'

export default function Login() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'founder' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setError(''); setLoading(true)
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register'
      const { data } = await api.post<TokenResponse>(endpoint, form)
      localStorage.setItem('access_token', data.access_token)
      nav('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: unknown } } }
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        // FastAPI validation errors: [{msg: "...", loc: [...]}]
        setError(detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(', '))
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-3">
            <Rocket size={22} className="text-white" />
          </div>
          <h1 className="text-text-primary text-xl font-bold">IFAVHub</h1>
          <p className="text-text-muted text-sm">Startup Ecosystem Platform</p>
        </div>

        <div className="card">
          <div className="flex mb-5 bg-bg-secondary rounded-lg p-1">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>{t}</button>
            ))}
          </div>

          <div className="space-y-3">
            {tab === 'register' && (
              <>
                <div><label className="label">Full Name</label><input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input" placeholder="John Doe" /></div>
                <div><label className="label">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
              </>
            )}
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="you@example.com" /></div>
            <div><label className="label">Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" onKeyDown={e => e.key === 'Enter' && handle()} /></div>
            {error && <p className="text-accent-red text-xs">{error}</p>}
            <button onClick={handle} disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
