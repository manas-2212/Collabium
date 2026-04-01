'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) router.replace('/onboarding')
  }, [email, router])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify', { email, otp: code })
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email })
      setResent(true)
      setCountdown(60)
    } catch {
      setError('Failed to resend OTP')
    }
  }

  const inputStyle = {
    width: '48px',
    height: '56px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: 600,
    textAlign: 'center' as const,
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
        padding: '36px 32px',
        textAlign: 'center'
      }}>

        <div style={{
          width: '52px', height: '52px',
          borderRadius: '50%',
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '22px'
        }}>
          ✉️
        </div>

        <h1 style={{
          fontSize: '22px', fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: '8px',
          letterSpacing: '-0.3px'
        }}>
          Check your email
        </h1>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          We sent a 6-digit code to
        </p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--primary-saffron)', marginBottom: '28px' }}>
          {email}
        </p>

        {/* OTP inputs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el }}
              style={{
                ...inputStyle,
                borderColor: digit ? 'var(--primary)' : 'var(--border)'
              }}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = digit ? 'var(--primary)' : 'var(--border)'}
              maxLength={1}
              inputMode="numeric"
            />
          ))}
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {resent && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#4ADE80',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            OTP resent successfully!
          </div>
        )}

        <button
          onClick={handleVerify}
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
            marginBottom: '16px'
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-deep)' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)' }}
        >
          {loading ? 'Verifying...' : 'Verify email →'}
        </button>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--primary-saffron)',
                  fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Resend code
              </button>
            )}
        </p>

      </div>
    </main>
  )
}

export default function Verify() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}