'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function Home() {
  const router = useRouter()
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      router.push('/chat')
    } else {
      router.push('/login')
    }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gmtm-bg-secondary">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-gmtm-teal border-t-transparent rounded-full animate-spin" />
        <span className="text-gmtm-text-secondary">Loading...</span>
      </div>
    </div>
  )
}
