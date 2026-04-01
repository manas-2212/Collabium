'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Post } from '@/types'
import api from '@/lib/api'
import { isAuthenticated, getUser } from '@/lib/auth'

const POST_TYPE_COLORS: Record<string, string> = {
  JOB: '#4ADE80',
  INTERNSHIP: '#60A5FA',
  COLLAB: '#FB923C',
  PITCH: '#C084FC'
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me')
      setUser(res.data.user)
      const postsRes = await api.get('/posts/my')
      setPosts(postsRes.data.posts)
    } catch {
      router.replace('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Profile card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: user.avatar ? 'transparent' : 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
                boxShadow: '0 0 20px rgba(249,115,22,0.25)'
              }}>
                {user.avatar
                  ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                }
              </div>

              <div>
                <h1 style={{
                  fontSize: '20px', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '4px',
                  letterSpacing: '-0.3px'
                }}>
                  {user.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '999px',
                    fontSize: '11px', fontWeight: 600,
                    color: user.role === 'STUDENT' ? '#C084FC'
                      : user.role === 'ALUMNI' ? '#4ADE80' : '#FB923C',
                    background: user.role === 'STUDENT' ? 'rgba(192,132,252,0.1)'
                      : user.role === 'ALUMNI' ? 'rgba(74,222,128,0.1)' : 'rgba(249,115,22,0.1)',
                    border: `1px solid ${user.role === 'STUDENT' ? 'rgba(192,132,252,0.2)'
                      : user.role === 'ALUMNI' ? 'rgba(74,222,128,0.2)' : 'rgba(249,115,22,0.2)'}`
                  }}>
                    {user.role}
                  </span>
                  {user.batch && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Batch {user.batch}
                    </span>
                  )}
                  {user.domain && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      · {user.domain}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/profile/edit"
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '13px', color: 'var(--text-secondary)',
                fontWeight: 500, flexShrink: 0, transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              Edit profile
            </Link>
          </div>

          {/* Bio */}
          {user.bio && (
            <p style={{
              fontSize: '14px', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: '20px'
            }}>
              {user.bio}
            </p>
          )}

          {/* Skills */}
          {user.skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
                SKILLS
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {user.skills.map(skill => (
                  <span key={skill} style={{
                    padding: '4px 12px', borderRadius: '999px',
                    fontSize: '12px', color: 'var(--primary-saffron)',
                    border: '1px solid rgba(249,115,22,0.25)',
                    background: 'rgba(249,115,22,0.06)'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(user.githubUrl || user.linkedinUrl || user.resumeUrl) && (
            <div style={{
              display: 'flex', gap: '8px', flexWrap: 'wrap',
              paddingTop: '16px', borderTop: '1px solid var(--border)'
            }}>
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noreferrer" style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: '13px', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.15s'
                }}>
                  GitHub ↗
                </a>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: '13px', color: 'var(--text-secondary)',
                  transition: 'all 0.15s'
                }}>
                  LinkedIn ↗
                </a>
              )}
              {user.resumeUrl && (
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  background: 'rgba(249,115,22,0.06)',
                  fontSize: '13px', color: 'var(--primary-saffron)',
                  transition: 'all 0.15s'
                }}>
                  Resume ↓
                </a>
              )}
            </div>
          )}

          {/* Empty state for links */}
          {!user.githubUrl && !user.linkedinUrl && !user.resumeUrl && !user.bio && user.skills.length === 0 && (
            <div style={{
              padding: '16px', borderRadius: 'var(--radius)',
              border: '1px dashed var(--border)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Your profile is incomplete
              </p>
              <Link href="/profile/edit" style={{
                fontSize: '13px', color: 'var(--primary-saffron)', fontWeight: 500
              }}>
                Complete your profile →
              </Link>
            </div>
          )}
        </div>

        {/* Posts */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              My posts ({posts.length})
            </h2>
            <Link href="/pitches/new" style={{
              fontSize: '13px', color: 'var(--primary-saffron)', fontWeight: 500
            }}>
              + New post
            </Link>
          </div>

          {posts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No posts yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {posts.map(post => (
                <Link key={post.id} href={`/posts/${post.id}`} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px',
                  padding: '12px 14px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 600,
                        color: POST_TYPE_COLORS[post.type],
                        padding: '2px 8px', borderRadius: '999px',
                        background: `${POST_TYPE_COLORS[post.type]}15`
                      }}>
                        {post.type}
                      </span>
                      {post.status === 'CLOSED' && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CLOSED</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {post.title}
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {post._count?.interests} interested
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}