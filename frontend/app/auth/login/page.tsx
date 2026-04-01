'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { setAuth } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      setAuth(res.data.token, res.data.user)
      router.replace('/feed')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
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
        maxWidth: '400px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 32px'
      }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(249,115,22,0.3)'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>R</span>
          </div>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '6px',
            letterSpacing: '-0.3px'
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {registered
              ? 'Account created! Log in to get started.'
              : 'Log in to your RUnite account.'}
          </p>
        </div>

        {registered && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#4ADE80',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            Account created successfully. You can now log in.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@nst.rishihood.edu.in"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
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
            {loading ? 'Logging in...' : 'Log in →'}
          </button>

        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/onboarding" style={{ color: 'var(--primary-saffron)', fontWeight: 500 }}>
            Get started
          </Link>
        </p>

      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
