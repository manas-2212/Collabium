'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Post } from '@/types'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import Link from 'next/link'

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

export default function Feed() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const filters = ['ALL', 'JOB', 'INTERNSHIP', 'COLLAB', 'PITCH']

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) {
      router.replace('/auth/login')
      return
    }
    fetchFeed()
  }, [filter, page])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 10 }
      if (filter !== 'ALL') params.type = filter
      const res = await api.get('/posts/feed', { params })
      setPosts(res.data.posts)
      setTotalPages(res.data.pagination.totalPages)
    } catch {
      router.replace('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Your feed
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Matched to your skills and batch
            </p>
          </div>
          <Link
            href="/pitches/new"
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius)',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 0 16px rgba(249,115,22,0.25)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            + Post
          </Link>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex', gap: '6px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === f ? 'rgba(249,115,22,0.1)' : 'var(--surface)',
                color: filter === f ? 'var(--primary-saffron)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: filter === f ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap' as const
              }}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '140px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No posts found
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {filter === 'ALL'
                ? 'No posts yet. Be the first to post something!'
                : `No ${filter.toLowerCase()} posts yet.`}
            </p>
            <Link
              href="/pitches/new"
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius)',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 500,
                fontSize: '13px'
              }}
            >
              Create a post
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                style={{
                  display: 'block',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  transition: 'all 0.15s',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'
                  e.currentTarget.style.background = 'rgba(249,115,22,0.02)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                }}
              >
                {/* Post type + meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: POST_TYPE_COLORS[post.type],
                    background: POST_TYPE_BG[post.type],
                    border: `1px solid ${POST_TYPE_COLORS[post.type]}30`
                  }}>
                    {post.type}
                  </span>
                  {post.batchPref && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Batch {post.batchPref}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  lineHeight: 1.4
                }}>
                  {post.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any,
                  overflow: 'hidden'
                }}>
                  {post.description}
                </p>

                {/* Skill tags */}
                {post.skillTags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {post.skillTags.slice(0, 4).map(tag => (
                      <span key={tag} style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)'
                      }}>
                        {tag}
                      </span>
                    ))}
                    {post.skillTags.length > 4 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px 0' }}>
                        +{post.skillTags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px', height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#fff'
                    }}>
                      {post.author.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {post.author.name}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'var(--surface)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}>
                      {post.author.role}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {post.relevanceScore !== undefined && post.relevanceScore > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--primary-saffron)' }}>
                        ⚡ {post.relevanceScore} match
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post._count?.interests} interested
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: '8px', marginTop: '24px'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '13px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>
            <span style={{
              padding: '8px 16px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '13px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}