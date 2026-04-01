'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post, Interest } from '@/types'
import api from '@/lib/api'
import { getUser, isAuthenticated } from '@/lib/auth'

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

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)


  const [post, setPost] = useState<Post | null>(null)
  const [applicants, setApplicants] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  
  useEffect(() => {
    setCurrentUser(getUser())
  }, [])


  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login')
      return
    }
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`)
      setPost(res.data.post)

      if (res.data.post.authorId === currentUser?.id) {
        const appRes = await api.get(`/interests/post/${id}`)
        setApplicants(appRes.data.applicants)
      } else {
        const myRes = await api.get('/interests/my')
        const already = myRes.data.interests.find(
          (i: Interest) => i.postId === id
        )
        if (already) setAlreadyApplied(true)
      }
    } catch {
      router.replace('/feed')
    } finally {
      setLoading(false)
    }
  }

  const handleInterest = async () => {
    setSubmitting(true)
    setErrorMsg('')
    try {
      await api.post('/interests', { postId: id, message })
      setAlreadyApplied(true)
      setSuccessMsg('Interest expressed! The poster has been notified.')
      setMessage('')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to express interest')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (interestId: string, status: string) => {
    try {
      await api.patch(`/interests/${interestId}`, { status })
      setApplicants(prev =>
        prev.map(a => a.id === interestId ? { ...a, status: status as any } : a)
      )
    } catch {}
  }

  const isAuthor = post?.authorId === currentUser?.id

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    transition: 'border-color 0.15s'
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  if (!post) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Back */}
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

        {/* Post card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '16px'
        }}>

          {/* Type + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: POST_TYPE_COLORS[post.type],
              background: POST_TYPE_BG[post.type],
              border: `1px solid ${POST_TYPE_COLORS[post.type]}30`
            }}>
              {post.type}
            </span>
            {post.batchPref && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Batch {post.batchPref}
              </span>
            )}
            {post.targetRole && (
              <span style={{
                fontSize: '12px', color: 'var(--text-muted)',
                padding: '3px 10px', borderRadius: '999px',
                border: '1px solid var(--border)', background: 'var(--surface)'
              }}>
                For {post.targetRole}s
              </span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '12px',
            letterSpacing: '-0.3px', lineHeight: 1.3
          }}>
            {post.title}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            lineHeight: 1.8, marginBottom: '20px', whiteSpace: 'pre-wrap'
          }}>
            {post.description}
          </p>

          {/* Skill tags */}
          {post.skillTags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {post.skillTags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px', borderRadius: '999px',
                  fontSize: '12px', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', background: 'var(--surface)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '12px', paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <Link href={`/profile/${post.author.id}`}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: post.author.avatar ? 'transparent' : 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer',
                boxShadow: '0 0 12px rgba(249,115,22,0.2)'
              }}>
                {post.author.avatar
                  ? <img src={post.author.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                      {post.author.name?.charAt(0).toUpperCase()}
                    </span>
                }
              </div>
            </Link>
            <div style={{ flex: 1 }}>
              <Link href={`/profile/${post.author.id}`}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  {post.author.name}
                </p>
              </Link>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {post.author.role}
                </span>
                {post.author.batch && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    · Batch {post.author.batch}
                  </span>
                )}
                {post.author.domain && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    · {post.author.domain}
                  </span>
                )}
              </div>
            </div>

            {/* Author links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {post.author.githubUrl && (
                <a href={post.author.githubUrl} target="_blank" rel="noreferrer" style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: '12px', color: 'var(--text-secondary)', transition: 'all 0.15s'
                }}>
                  GitHub
                </a>
              )}
              {post.author.linkedinUrl && (
                <a href={post.author.linkedinUrl} target="_blank" rel="noreferrer" style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: '12px', color: 'var(--text-secondary)', transition: 'all 0.15s'
                }}>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {post._count?.interests} {post._count?.interests === 1 ? 'person' : 'people'} interested
            </span>
          </div>
        </div>

        {/* Express interest — non-authors only */}
        {!isAuthor && post.status === 'ACTIVE' && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: '14px'
            }}>
              {alreadyApplied ? 'You expressed interest' : 'Express interest'}
            </h3>

            {successMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#4ADE80', fontSize: '13px', marginBottom: '12px'
              }}>
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171', fontSize: '13px', marginBottom: '12px'
              }}>
                {errorMsg}
              </div>
            )}

            {alreadyApplied ? (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                border: '1px solid rgba(249,115,22,0.2)',
                background: 'rgba(249,115,22,0.06)',
                fontSize: '13px', color: 'var(--primary-saffron)'
              }}>
                ✓ Your interest has been sent. The poster will review and get in touch.
              </div>
            ) : (
              <>
                <textarea
                  style={inputStyle}
                  placeholder="Add a note — your experience, why you're interested, anything relevant (optional)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  onClick={handleInterest}
                  disabled={submitting}
                  style={{
                    marginTop: '12px',
                    padding: '11px 24px',
                    borderRadius: 'var(--radius)',
                    background: submitting ? 'rgba(249,115,22,0.5)' : 'var(--primary)',
                    color: '#fff', fontWeight: 600, fontSize: '14px',
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: '0 0 16px rgba(249,115,22,0.2)'
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--primary-deep)' }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--primary)' }}
                >
                  {submitting ? 'Sending...' : 'Express interest →'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Applicants — author only */}
        {isAuthor && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: '16px'
            }}>
              Applicants ({applicants.length})
            </h3>

            {applicants.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No one has expressed interest yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applicants.map(applicant => (
                  <div key={applicant.id} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

                      {/* Avatar */}
                      <Link href={`/profile/${applicant.user?.id}`}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: applicant.user?.avatar ? 'transparent' : 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', flexShrink: 0, cursor: 'pointer'
                        }}>
                          {applicant.user?.avatar
                            ? <img src={applicant.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                                {applicant.user?.name?.charAt(0).toUpperCase()}
                              </span>
                          }
                        </div>
                      </Link>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Link href={`/profile/${applicant.user?.id}`}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                              {applicant.user?.name}
                            </span>
                          </Link>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {applicant.user?.role}
                          </span>
                          {applicant.user?.batch && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              · Batch {applicant.user.batch}
                            </span>
                          )}

                          {/* Status badge */}
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '11px', fontWeight: 500,
                            padding: '2px 8px', borderRadius: '999px',
                            color: applicant.status === 'SHORTLISTED' ? '#4ADE80'
                              : applicant.status === 'REJECTED' ? '#F87171'
                              : 'var(--text-muted)',
                            background: applicant.status === 'SHORTLISTED' ? 'rgba(74,222,128,0.08)'
                              : applicant.status === 'REJECTED' ? 'rgba(239,68,68,0.08)'
                              : 'var(--surface)',
                            border: `1px solid ${applicant.status === 'SHORTLISTED' ? 'rgba(74,222,128,0.2)'
                              : applicant.status === 'REJECTED' ? 'rgba(239,68,68,0.2)'
                              : 'var(--border)'}`
                          }}>
                            {applicant.status}
                          </span>
                        </div>

                        {/* Skills */}
                        {applicant.user?.skills && applicant.user.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {applicant.user.skills.slice(0, 5).map(s => (
                              <span key={s} style={{
                                padding: '2px 8px', borderRadius: '999px',
                                fontSize: '11px', color: 'var(--text-secondary)',
                                border: '1px solid var(--border)', background: 'var(--surface)'
                              }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Message */}
                        {applicant.message && (
                          <p style={{
                            fontSize: '13px', color: 'var(--text-secondary)',
                            lineHeight: 1.6, marginBottom: '10px',
                            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)'
                          }}>
                            "{applicant.message}"
                          </p>
                        )}

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {applicant.user?.githubUrl && (
                            <a href={applicant.user.githubUrl} target="_blank" rel="noreferrer" style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)', background: 'var(--surface)',
                              fontSize: '12px', color: 'var(--text-secondary)'
                            }}>
                              GitHub
                            </a>
                          )}
                          {applicant.user?.linkedinUrl && (
                            <a href={applicant.user.linkedinUrl} target="_blank" rel="noreferrer" style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)', background: 'var(--surface)',
                              fontSize: '12px', color: 'var(--text-secondary)'
                            }}>
                              LinkedIn
                            </a>
                          )}
                          {applicant.user?.resumeUrl && (
                            <a href={applicant.user.resumeUrl} target="_blank" rel="noreferrer" style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(249,115,22,0.3)',
                              background: 'rgba(249,115,22,0.06)',
                              fontSize: '12px', color: 'var(--primary-saffron)'
                            }}>
                              Resume ↓
                            </a>
                          )}

                          {/* Action buttons */}
                          {applicant.status === 'PENDING' || applicant.status === 'SEEN' ? (
                            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                              <button
                                onClick={() => handleStatusUpdate(applicant.id, 'SHORTLISTED')}
                                style={{
                                  padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                                  border: '1px solid rgba(74,222,128,0.3)',
                                  background: 'rgba(74,222,128,0.06)',
                                  color: '#4ADE80', fontSize: '12px', cursor: 'pointer',
                                  fontWeight: 500
                                }}
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(applicant.id, 'REJECTED')}
                                style={{
                                  padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  background: 'rgba(239,68,68,0.06)',
                                  color: '#F87171', fontSize: '12px', cursor: 'pointer',
                                  fontWeight: 500
                                }}
                              >
                                Pass
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}