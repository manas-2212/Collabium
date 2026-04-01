'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isAuthenticated, getUser } from '@/lib/auth'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth/login'); return }
    const user = getUser()
    if (user?.role !== 'ADMIN') { router.replace('/feed'); return }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } finally {
      setLoading(false)
    }
  }

  const statCard = (label: string, value: number, accent?: string) => (
    <div style={{
      padding: '20px',
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${accent ? accent + '30' : 'var(--border)'}`,
      background: accent ? accent + '08' : 'var(--bg-secondary)'
    }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
        {label.toUpperCase()}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: accent || 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  )

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: '6px'
          }}>
            Admin dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage the RUnite community
          </p>
        </div>

        {/* Stats grid */}
        {stats && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px', marginBottom: '24px'
            }}>
              {statCard('Total users', stats.users.total)}
              {statCard('Students', stats.users.students, '#C084FC')}
              {statCard('Alumni', stats.users.alumni, '#4ADE80')}
              {statCard('Active posts', stats.posts.active, '#FB923C')}
              {statCard('Total interests', stats.interests.total, '#60A5FA')}
              {statCard('New this week', stats.thisWeek.newUsers)}
            </div>

            {/* Pending alert */}
            {stats.users.pendingVerification > 0 && (
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(249,115,22,0.3)',
                background: 'rgba(249,115,22,0.06)',
                marginBottom: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-saffron)', marginBottom: '2px' }}>
                    {stats.users.pendingVerification} alumni pending verification
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Review and approve their accounts
                  </p>
                </div>
                <Link href="/admin/alumni" style={{
                  padding: '8px 16px', borderRadius: 'var(--radius)',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '13px', fontWeight: 600
                }}>
                  Review →
                </Link>
              </div>
            )}
          </>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            {
              href: '/admin/alumni',
              title: 'Alumni verification',
              desc: 'Approve or reject pending alumni accounts',
              color: '#4ADE80'
            },
            {
              href: '/admin/posts',
              title: 'Post moderation',
              desc: 'Review and remove posts from the platform',
              color: '#60A5FA'
            }
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              display: 'block', transition: 'all 0.15s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = item.color + '40'
                e.currentTarget.style.background = item.color + '06'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
            >
              <p style={{
                fontSize: '15px', fontWeight: 600,
                color: item.color, marginBottom: '6px'
              }}>
                {item.title}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}