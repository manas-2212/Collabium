'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Link from 'next/link'

export default function Landing() {
  const router = useRouter()

  // useEffect(() => {
  //   if (isAuthenticated()) router.replace('/feed')
  // }, [router])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Glow blob */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div style={{
        width: '52px',
        height: '52px',
        background: 'var(--primary)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        boxShadow: '0 0 32px rgba(249,115,22,0.4)'
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.5px' }}>C</span>
      </div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '999px',
        border: '1px solid rgba(249,115,22,0.3)',
        background: 'rgba(249,115,22,0.08)',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--primary)'
        }} />
        <span style={{ fontSize: '12px', color: 'var(--primary-saffron)', fontWeight: 500 }}>
          Rishihood University — exclusive network
        </span>
      </div>

      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 44px)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '14px',
        textAlign: 'center',
        letterSpacing: '-0.5px',
        lineHeight: 1.2
      }}>
        Collabium<br />
        <span style={{ color: 'var(--primary)' }}>Private Network</span>
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        maxWidth: '380px',
        marginBottom: '44px',
        lineHeight: 1.7
      }}>
        Students and alumni — sharing ideas, opportunities, and building together in one verified space.
      </p>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '44px'
      }}>
        {['Jobs & Internships', 'Startup Pitches', 'Collaborations', 'Alumni Network'].map(f => (
          <span key={f} style={{
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>{f}</span>
        ))}
      </div>

      {/* CTAs */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '320px'
      }}>
        <Link href="/onboarding" style={{
          background: 'var(--primary)',
          color: '#fff',
          padding: '14px 24px',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
          fontSize: '15px',
          textAlign: 'center',
          transition: 'all 0.15s',
          boxShadow: '0 0 20px rgba(249,115,22,0.3)'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--primary-deep)'
            e.currentTarget.style.boxShadow = '0 0 28px rgba(249,115,22,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--primary)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(249,115,22,0.3)'
          }}
        >
          Get started →
        </Link>

        <Link href="/auth/login" style={{
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          padding: '14px 24px',
          borderRadius: 'var(--radius)',
          fontWeight: 500,
          fontSize: '15px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          transition: 'border-color 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          Already have an account
        </Link>
      </div>

      <p style={{ marginTop: '36px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Verified community · No public access
      </p>
    </main>
  )
}