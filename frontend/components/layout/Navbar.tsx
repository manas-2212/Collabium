'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Notification } from '@/types'
import api from '@/lib/api'

export default function Navbar() {
  const { user, loading, logout } = useAuth()

  const pathname = usePathname()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  const navLinks = [
    { href: '/feed', label: 'Feed' },
    { href: '/pitches', label: 'Pitches' },
    { href: '/posts/my', label: 'My Posts' },
  ]

  const isActive = (href: string) => pathname === href

  if (loading) return (
    <nav style={{
      height: '56px',
      background: 'rgba(15,14,12,0.85)',
      borderBottom: '1px solid var(--border)'
    }} />
  )
  
  if (!user) return null


  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(15,14,12,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>

      {/* Left — logo + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--primary)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(249,115,22,0.4)'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>R</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            RUnite
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: isActive(link.href) ? 500 : 400,
                color: isActive(link.href) ? 'var(--primary-saffron)' : 'var(--text-secondary)',
                background: isActive(link.href) ? 'rgba(249,115,22,0.08)' : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              {link.label}
            </Link>
          ))}
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: isActive('/admin') ? 500 : 400,
                color: isActive('/admin') ? 'var(--primary-saffron)' : 'var(--text-secondary)',
                background: isActive('/admin') ? 'rgba(249,115,22,0.08)' : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Right — notifs + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifs(!showNotifs)
              setShowUserMenu(false)
              if (!showNotifs && unreadCount > 0) markAllRead()
            }}
            style={{
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: showNotifs ? 'var(--surface-hover)' : 'var(--surface)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
              position: 'relative',
              transition: 'all 0.15s',
              cursor: 'pointer'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px', right: '-4px',
                width: '16px', height: '16px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              top: '44px', right: 0,
              width: '320px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              zIndex: 200
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        background: !n.isRead ? 'rgba(249,115,22,0.04)' : 'transparent',
                        cursor: n.refId ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (n.refId) {
                          router.push(`/posts/${n.refId}`)
                          setShowNotifs(false)
                        }
                      }}
                    >
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '4px' }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                      {!n.isRead && (
                        <div style={{
                          width: '6px', height: '6px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          position: 'absolute',
                          right: '16px',
                          marginTop: '-28px'
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifs(false)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '4px 10px 4px 4px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: showUserMenu ? 'var(--surface-hover)' : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: user.avatar ? 'transparent' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user.name.split(' ')[0]}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▾</span>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '44px', right: 0,
              width: '200px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              zIndex: 200
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.role}</p>
              </div>

              {[
                { label: 'My Profile', href: '/profile' },
                { label: 'Edit Profile', href: '/profile/edit' },
                { label: 'My Posts', href: '/posts/my' }
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)',
                    transition: 'all 0.1s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={logout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#F87171',
                  cursor: 'pointer',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}