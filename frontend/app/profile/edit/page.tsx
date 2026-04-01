'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { isAuthenticated, updateStoredUser } from '@/lib/auth'
import { User } from '@/types'

const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript', 'Python',
  'Figma', 'UI/UX', 'Marketing', 'Finance', 'Excel', 'Data Analysis',
  'Machine Learning', 'Django', 'Express.js', 'PostgreSQL', 'AWS'
]

const DOMAINS = ['Tech', 'Finance', 'Design', 'Marketing', 'Operations', 'Healthcare', 'Education', 'Other']
const BATCHES = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

export default function EditProfile() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    bio: '',
    batch: '',
    domain: '',
    githubUrl: '',
    linkedinUrl: '',
    resumeUrl: ''
  })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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
      const u: User = res.data.user
      setForm({
        name: u.name || '',
        bio: u.bio || '',
        batch: u.batch || '',
        domain: u.domain || '',
        githubUrl: u.githubUrl || '',
        linkedinUrl: u.linkedinUrl || '',
        resumeUrl: u.resumeUrl || ''
      })
      setSkills(u.skills || [])
    } finally {
      setFetching(false)
    }
  }

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 12) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillInput)
    }
    if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await api.patch('/users/profile', { ...form, skills })
      updateStoredUser(res.data.user)
      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
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

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '6px'
  }

  if (fetching) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

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
          color: 'var(--text-primary)', marginBottom: '24px',
          letterSpacing: '-0.3px'
        }}>
          Edit profile
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '90px', lineHeight: 1.7 }}
              placeholder="Tell the community about yourself..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Batch + Domain */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Batch year</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.batch}
                onChange={e => setForm({ ...form, batch: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Select</option>
                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Domain</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.domain}
                onChange={e => setForm({ ...form, domain: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Select</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label style={labelStyle}>
              Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                (used for matching — add up to 12)
              </span>
            </label>
            <div
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px',
                padding: '10px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', background: 'var(--surface)',
                minHeight: '46px', cursor: 'text'
              }}
              onClick={() => document.getElementById('skill-edit-input')?.focus()}
            >
              {skills.map(skill => (
                <span key={skill} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', borderRadius: '999px',
                  fontSize: '12px', color: 'var(--primary-saffron)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  background: 'rgba(249,115,22,0.08)'
                }}>
                  {skill}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeSkill(skill) }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '14px', lineHeight: 1, padding: 0
                    }}
                  >×</button>
                </span>
              ))}
              <input
                id="skill-edit-input"
                style={{
                  border: 'none', outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '13px', minWidth: '120px', flex: 1
                }}
                placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
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

          {/* Links */}
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '2px' }}>
              Profile links
            </p>
            <div>
              <label style={labelStyle}>GitHub URL</label>
              <input
                style={inputStyle}
                placeholder="https://github.com/username"
                value={form.githubUrl}
                onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input
                style={inputStyle}
                placeholder="https://linkedin.com/in/username"
                value={form.linkedinUrl}
                onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Resume URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Cloudinary PDF link)</span></label>
              <input
                style={inputStyle}
                placeholder="https://res.cloudinary.com/..."
                value={form.resumeUrl}
                onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
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

          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              color: '#4ADE80', fontSize: '13px'
            }}>
              Profile updated! Redirecting...
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
              {loading ? 'Saving...' : 'Save changes →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}