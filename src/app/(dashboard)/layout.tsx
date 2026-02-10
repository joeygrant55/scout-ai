'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    if (!token || !user) {
      router.push('/login')
      return
    }
    // If no GMTM profile linked and not already on /connect, redirect
    if (!user.gmtmUserId && pathname !== '/connect') {
      router.push('/connect')
    }
  }, [token, user, router, checkAuth, pathname])

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gmtm-bg-secondary">
        <div className="animate-pulse text-gmtm-text-secondary">Redirecting to login...</div>
      </div>
    )
  }

  // Connect page gets full screen (no sidebar)
  if (pathname === '/connect') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-gmtm-bg-secondary">{children}</main>
    </div>
  )
}
