'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const u = getUser()
    setUser(u)
    setLoading(false)
  }, [])

  const logout = () => {
    clearAuth()
    router.push('/')
  }

  const refreshUser = () => {
    const u = getUser()
    setUser(u)
  }

  return {
    user,
    loading,
    logout,
    refreshUser,
    isAuthenticated: isAuthenticated()
  }
}