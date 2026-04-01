'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { useEffect, useState } from 'react'

const PUBLIC_ROUTES = ['/', '/onboarding', '/auth/login', '/auth/register', '/auth/verify']

export default function NavbarWrapper() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isPublic = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith('/auth/')
  )

  if (!mounted) return null
  if (isPublic) return null

  return <Navbar />
}