'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { token, user, isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    if (!token || !user) {
      router.push('/login')
    }
  }, [token, user, router, checkAuth])

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gmtm-bg-secondary">
        <div className="animate-pulse text-gmtm-text-secondary">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-gmtm-bg-secondary">{children}</main>
    </div>
  )
}
