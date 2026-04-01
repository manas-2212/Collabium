'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { isAuthenticated, getUser } from '@/lib/auth'

export default function AdminAlumni() {
  const router = useRouter()
  const [alumni, setAlumni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth/login'); return }
    const user = getUser()
    if (user?.role !== 'ADMIN') { router.replace('/feed'); return }
    fetchPendingAlumni()
  }, [])

  const fetchPendingAlumni = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { role: 'ALUMNI', isVerified: false }
      })
      setAlumni(res.data.users)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action)
    try {
      await api.patch(`/admin/users/${id}/verify`, { action })
      setAlumni(prev => prev.filter(a => a.id !== id))
    } catch {}
    finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '13px',
            cursor: 'pointer', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: '6px'
          }}>
            Alumni verification
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {alumni.length} pending {alumni.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
        ) : alumni.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>✓</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
              All caught up
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              No pending alumni accounts to review.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alumni.map(a => (
              <div key={a.id} style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                          {a.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {a.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {a.email}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginLeft: '46px' }}>
                      {a.batch && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Batch {a.batch}
                        </span>
                      )}
                      {a.domain && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {a.domain}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Registered {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleAction(a.id, 'approve')}
                      disabled={!!actionLoading}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        background: 'rgba(74,222,128,0.06)',
                        color: '#4ADE80', fontSize: '13px',
                        fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s', opacity: actionLoading ? 0.6 : 1
                      }}
                    >
                      {actionLoading === a.id + 'approve' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(a.id, 'reject')}
                      disabled={!!actionLoading}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.06)',
                        color: '#F87171', fontSize: '13px',
                        fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s', opacity: actionLoading ? 0.6 : 1
                      }}
                    >
                      {actionLoading === a.id + 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}