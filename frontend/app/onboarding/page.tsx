'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Onboarding() {
  const router = useRouter()
  const [selected, setSelected] = useState<'STUDENT' | 'ALUMNI' | null>(null)
  const [hovered, setHovered] = useState<'STUDENT' | 'ALUMNI' | null>(null)

  const cardStyle = (role: 'STUDENT' | 'ALUMNI') => ({
    padding: '22px 20px',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${
      selected === role
        ? 'var(--primary)'
        : hovered === role
        ? 'rgba(249,115,22,0.3)'
        : 'var(--border)'
    }`,
    background: selected === role ? 'rgba(249,115,22,0.08)' : 'var(--surface)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left' as const,
    width: '100%',
    boxShadow: selected === role ? '0 0 20px rgba(249,115,22,0.1)' : 'none'
  })

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

      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div style={{
        width: '44px',
        height: '44px',
        background: 'var(--primary)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        boxShadow: '0 0 24px rgba(249,115,22,0.35)'
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>C</span>
      </div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        textAlign: 'center',
        letterSpacing: '-0.3px'
      }}>
        Who are you at Rishihood?
      </h1>

      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        This helps us set up the right experience for you.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '380px',
        marginBottom: '24px'
      }}>

        {[
          {
            role: 'STUDENT' as const,
            icon: '🎓',
            title: "I'm a Student",
            desc: 'Currently studying at Rishihood University'
          },
          {
            role: 'ALUMNI' as const,
            icon: '💼',
            title: "I'm an Alumni",
            desc: 'Graduated from Rishihood University'
          }
        ].map(({ role, icon, title, desc }) => (
          <button
            key={role}
            style={cardStyle(role)}
            onClick={() => setSelected(role)}
            onMouseEnter={() => setHovered(role)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: selected === role ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
                transition: 'background 0.15s'
              }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '15px',
                  color: selected === role ? 'var(--primary-saffron)' : 'var(--text-primary)',
                  marginBottom: '2px',
                  transition: 'color 0.15s'
                }}>
                  {title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {desc}
                </div>
              </div>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${selected === role ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
                background: selected === role ? 'var(--primary)' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}>
                {selected === role && (
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && router.push(`/auth/register?role=${selected}`)}
        disabled={!selected}
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '14px',
          borderRadius: 'var(--radius)',
          background: selected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
          color: selected ? '#fff' : 'var(--text-muted)',
          fontWeight: 600,
          fontSize: '15px',
          border: 'none',
          cursor: selected ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
          boxShadow: selected ? '0 0 20px rgba(249,115,22,0.25)' : 'none'
        }}
        onMouseEnter={e => { if (selected) e.currentTarget.style.background = 'var(--primary-deep)' }}
        onMouseLeave={e => { if (selected) e.currentTarget.style.background = 'var(--primary)' }}
      >
        Continue →
      </button>

      <button
        onClick={() => router.back()}
        style={{
          marginTop: '16px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Go back
      </button>
    </main>
  )
}