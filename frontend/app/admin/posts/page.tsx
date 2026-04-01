'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isAuthenticated, getUser } from '@/lib/auth'

const POST_TYPE_COLORS: Record<string, string> = {
  JOB: '#4ADE80',
  INTERNSHIP: '#60A5FA',
  COLLAB: '#FB923C',
  PITCH: '#C084FC'
}

export default function AdminPosts() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ACTIVE')
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth/login'); return }
    const user = getUser()
    if (user?.role !== 'ADMIN') { router.replace('/feed'); return }
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/posts', { params: { status: filter } })
      setPosts(res.data.posts)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string, title: string) => {
    const reason = prompt(`Reason for removing "${title}"? (optional)`)
    if (reason === null) return
    setRemoving(id)
    try {
      await api.delete(`/admin/posts/${id}`, { data: { reason } })
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch {}
    finally { setRemoving(null) }
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

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: '6px'
            }}>
              Post moderation
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {posts.length} {filter.toLowerCase()} posts
            </p>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ACTIVE', 'CLOSED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '999px',
                  border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                  background: filter === f ? 'rgba(249,115,22,0.1)' : 'var(--surface)',
                  color: filter === f ? 'var(--primary-saffron)' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: filter === f ? 500 : 400,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No {filter.toLowerCase()} posts found.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map(post => (
              <div key={post.id} style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: 600,
                      color: POST_TYPE_COLORS[post.type],
                      background: POST_TYPE_COLORS[post.type] + '15'
                    }}>
                      {post.type}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link href={`/posts/${post.id}`}>
                    <p style={{
                      fontSize: '14px', fontWeight: 600,
                      color: 'var(--text-primary)', marginBottom: '4px',
                      cursor: 'pointer', lineHeight: 1.4
                    }}>
                      {post.title}
                    </p>
                  </Link>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      by {post.author.name} · {post.author.role}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post._count.interests} interested
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(post.id, post.title)}
                  disabled={removing === post.id}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.06)',
                    color: '#F87171', fontSize: '12px', fontWeight: 500,
                    cursor: removing === post.id ? 'not-allowed' : 'pointer',
                    flexShrink: 0, transition: 'all 0.15s',
                    opacity: removing === post.id ? 0.6 : 1
                  }}
                >
                  {removing === post.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}