'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as 'STUDENT' | 'ALUMNI' | null

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    batch: '',
    domain: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!roleParam) router.replace('/onboarding')
  }, [roleParam, router])

  const domains = ['Tech', 'Finance', 'Design', 'Marketing', 'Operations', 'Healthcare', 'Education', 'Other']
  const batches = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (roleParam === 'STUDENT' && !form.email.endsWith('@rishihood.edu.in') && !form.email.endsWith('@nst.rishihood.edu.in')) {
      setError('Students must use their @rishihood.edu.in email')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        ...form,
        role: roleParam
      })

      if (res.data.requiresOTP) {
        router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`)
      } else {
        router.push('/auth/login?registered=true')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '6px'
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)'
    }}>

      <div style={{
        position: 'absolute', top: '-100px', left: '50%',
        transform: 'translateX(-50%)', width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 32px'
      }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(249,115,22,0.3)',
            background: 'rgba(249,115,22,0.08)',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--primary-saffron)', fontWeight: 500 }}>
              {roleParam === 'STUDENT' ? '🎓 Student' : '💼 Alumni'}
            </span>
          </div>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '6px',
            letterSpacing: '-0.3px'
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {roleParam === 'STUDENT'
              ? 'Use your @rishihood.edu.in email to get verified instantly.'
              : 'Your account will be reviewed by an admin before activation.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>Full name</label>
            <input
              style={inputStyle}
              placeholder="Manas Selukar"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder={roleParam === 'STUDENT' ? 'you@nst.rishihood.edu.in' : 'you@gmail.com'}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Batch year</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.batch}
                onChange={e => setForm({ ...form, batch: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Select</option>
                {batches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Domain</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.domain}
                onChange={e => setForm({ ...form, domain: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Select</option>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 'var(--radius)',
              background: loading ? 'rgba(249,115,22,0.5)' : 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 0 20px rgba(249,115,22,0.2)',
              marginTop: '4px'
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-deep)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)' }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>

        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary-saffron)', fontWeight: 500 }}>
            Log in
          </Link>
        </p>

        <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Wrong role?{' '}
          <Link href="/onboarding" style={{ color: 'var(--text-secondary)' }}>
            Go back
          </Link>
        </p>

      </div>
    </main>
  )
}

export default function Register() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}