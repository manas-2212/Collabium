'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const POST_TYPES = [
  { value: 'JOB', label: 'Job', desc: 'Full-time or part-time role', color: '#4ADE80' },
  { value: 'INTERNSHIP', label: 'Internship', desc: 'Short-term opportunity', color: '#60A5FA' },
  { value: 'COLLAB', label: 'Collaboration', desc: 'Looking for a partner or teammate', color: '#FB923C' },
  { value: 'PITCH', label: 'Pitch', desc: 'Share a startup idea', color: '#C084FC' }
]

const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript', 'Python',
  'Figma', 'UI/UX', 'Marketing', 'Finance', 'Excel', 'Data Analysis',
  'Machine Learning', 'Django', 'Express.js', 'PostgreSQL', 'AWS'
]

const BATCHES = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

export default function NewPost() {
  const router = useRouter()

  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    batchPref: '',
    targetRole: ''
  })
  const [skillTags, setSkillTags] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/auth/login')
  }, [])

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skillTags.includes(trimmed) && skillTags.length < 8) {
      setSkillTags([...skillTags, trimmed])
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setSkillTags(skillTags.filter(s => s !== skill))
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillInput)
    }
    if (e.key === 'Backspace' && !skillInput && skillTags.length > 0) {
      removeSkill(skillTags[skillTags.length - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.type) { setError('Please select a post type'); return }
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }

    setLoading(true)
    try {
      const res = await api.post('/posts', {
        ...form,
        skillTags,
        targetRole: form.targetRole || null,
        batchPref: form.batchPref || null
      })
      router.push(`/posts/${res.data.post.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

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

        <h1 style={{
          fontSize: '22px', fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: '6px',
          letterSpacing: '-0.3px'
        }}>
          Create a post
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Share an opportunity, pitch an idea, or find a collaborator.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Post type */}
          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '10px'
            }}>
              Post type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {POST_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${form.type === t.value ? t.color + '60' : 'var(--border)'}`,
                    background: form.type === t.value ? t.color + '10' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    fontSize: '13px', fontWeight: 600,
                    color: form.type === t.value ? t.color : 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
            }}>
              Title
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Looking for a React dev co-founder"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
            }}>
              Description
            </label>
            <textarea
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '120px',
                lineHeight: 1.7
              }}
              placeholder="Describe what you're looking for, what the opportunity involves, and what you're offering..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Skill tags */}
          <div>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
            }}>
              Required skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — helps with matching)</span>
            </label>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px',
              padding: '10px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              minHeight: '46px',
              cursor: 'text'
            }}
              onClick={() => document.getElementById('skill-input')?.focus()}
            >
              {skillTags.map(tag => (
                <span key={tag} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', borderRadius: '999px',
                  fontSize: '12px', color: 'var(--primary-saffron)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  background: 'rgba(249,115,22,0.08)'
                }}>
                  {tag}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeSkill(tag) }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '14px', lineHeight: 1, padding: 0
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="skill-input"
                style={{
                  border: 'none', outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '13px', minWidth: '120px', flex: 1
                }}
                placeholder={skillTags.length === 0 ? 'Type a skill and press Enter...' : ''}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {SKILL_SUGGESTIONS.filter(s => !skillTags.includes(s)).slice(0, 8).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  style={{
                    padding: '3px 10px', borderRadius: '999px',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    fontSize: '11px', color: 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'
                    e.currentTarget.style.color = 'var(--primary-saffron)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Batch + Target role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
              }}>
                Preferred batch <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.batchPref}
                onChange={e => setForm({ ...form, batchPref: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Any batch</option>
                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px'
              }}>
                Visible to <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.targetRole}
                onChange={e => setForm({ ...form, targetRole: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Everyone</option>
                <option value="STUDENT">Students only</option>
                <option value="ALUMNI">Alumni only</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '12px 20px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-secondary)', fontWeight: 500,
                fontSize: '14px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '12px',
                borderRadius: 'var(--radius)',
                background: loading ? 'rgba(249,115,22,0.5)' : 'var(--primary)',
                color: '#fff', fontWeight: 600, fontSize: '14px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: '0 0 16px rgba(249,115,22,0.2)'
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-deep)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)' }}
            >
              {loading ? 'Publishing...' : 'Publish post →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}