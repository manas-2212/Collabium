'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/types'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const POST_TYPE_COLORS: Record<string, string> = {
  JOB: '#4ADE80',
  INTERNSHIP: '#60A5FA',
  COLLAB: '#FB923C',
  PITCH: '#C084FC'
}

const POST_TYPE_BG: Record<string, string> = {
  JOB: 'rgba(74,222,128,0.08)',
  INTERNSHIP: 'rgba(96,165,250,0.08)',
  COLLAB: 'rgba(249,115,22,0.08)',
  PITCH: 'rgba(192,132,252,0.08)'
}

export default function MyPosts() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
      return
    }
    fetchMyPosts()
  }, [])

  const fetchMyPosts = async () => {
    try {
      const res = await api.get('/posts/my')
      setPosts(res.data.posts)
    } catch {
      router.replace('/feed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (postId: string) => {
    try {
      await api.patch(`/posts/${postId}`, { status: 'CLOSED' })
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, status: 'CLOSED' } : p
      ))
    } catch {}
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.3px'
            }}>
              My posts
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
            </p>
          </div>
          <Link
            href="/pitches/new"
            style={{
              padding: '9px 18px', borderRadius: 'var(--radius)',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              boxShadow: '0 0 16px rgba(249,115,22,0.25)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            + New post
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: '120px', borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)', border: '1px solid var(--border)'
              }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📝</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No posts yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Share an opportunity, pitch an idea, or find a collaborator.
            </p>
            <Link href="/pitches/new" style={{
              padding: '9px 20px', borderRadius: 'var(--radius)',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 500, fontSize: '13px'
            }}>
              Create your first post
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map(post => (
              <div key={post.id} style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${post.status === 'CLOSED' ? 'var(--border)' : 'var(--border)'}`,
                background: post.status === 'CLOSED' ? 'rgba(255,255,255,0.01)' : 'var(--bg-secondary)',
                opacity: post.status === 'CLOSED' ? 0.6 : 1,
                transition: 'all 0.15s'
              }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: 600,
                        color: POST_TYPE_COLORS[post.type],
                        background: POST_TYPE_BG[post.type],
                        border: `1px solid ${POST_TYPE_COLORS[post.type]}30`
                      }}>
                        {post.type}
                      </span>
                      {post.status === 'CLOSED' && (
                        <span style={{
                          padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', color: 'var(--text-muted)',
                          border: '1px solid var(--border)', background: 'var(--surface)'
                        }}>
                          CLOSED
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link href={`/posts/${post.id}`}>
                      <h3 style={{
                        fontSize: '15px', fontWeight: 600,
                        color: 'var(--text-primary)', marginBottom: '6px',
                        cursor: 'pointer', lineHeight: 1.4
                      }}>
                        {post.title}
                      </h3>
                    </Link>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {post._count?.interests} {post._count?.interests === 1 ? 'person' : 'people'} interested
                    </p>

                    {post.skillTags.length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {post.skillTags.slice(0, 4).map(tag => (
                          <span key={tag} style={{
                            padding: '2px 8px', borderRadius: '999px',
                            fontSize: '11px', color: 'var(--text-secondary)',
                            border: '1px solid var(--border)', background: 'var(--surface)'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <Link
                      href={`/posts/${post.id}`}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)', background: 'var(--surface)',
                        fontSize: '12px', color: 'var(--text-secondary)',
                        textAlign: 'center', transition: 'all 0.15s'
                      }}
                    >
                      View
                    </Link>
                    {post.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleClose(post.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          fontSize: '12px', color: 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.04)',
                        fontSize: '12px', color: '#F87171',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      Delete
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