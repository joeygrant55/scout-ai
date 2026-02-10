'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useAuthStore } from '@/stores/authStore'

interface AthleteResult {
  user_id: number
  first_name: string
  last_name: string
  graduation_year?: number
  city?: string
  state?: string
  position?: string
  avatar_url?: string
}

export default function ConnectPage() {
  const router = useRouter()
  const { user, token, setGmtmUserId } = useAuthStore()
  const linkProfile = useMutation(api.auth.linkGmtmProfile)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AthleteResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState('')

  // If already linked, redirect to chat
  useEffect(() => {
    if (user?.gmtmUserId) {
      router.push('/chat')
    }
  }, [user?.gmtmUserId, router])

  const handleSearch = async () => {
    if (query.length < 2) return
    setIsSearching(true)
    setError('')

    try {
      const res = await fetch(`/api/athlete-search?name=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.athletes || data || [])
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleLink = async (athlete: AthleteResult) => {
    if (!token) return
    setIsLinking(true)
    setError('')

    try {
      await linkProfile({ token, gmtmUserId: athlete.user_id })
      setGmtmUserId(athlete.user_id)
      router.push('/chat')
    } catch {
      setError('Failed to link profile. Please try again.')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-gmtm-bg-secondary p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/sparq-logo-white.png"
            alt="SPARQ"
            width={160}
            height={40}
            className="h-10 w-auto mx-auto mb-6"
            priority
          />
          <h1 className="text-2xl font-bold text-gmtm-text mb-2">
            Connect Your Profile
          </h1>
          <p className="text-gmtm-text-secondary">
            Search for your GMTM athlete profile to get personalized insights
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name..."
            className="flex-1 px-4 py-3 rounded-xl bg-gmtm-bg border border-white/10 text-gmtm-text placeholder:text-gmtm-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gmtm-lime/50 focus:border-gmtm-lime/50 transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || query.length < 2}
            className="px-6 py-3 rounded-xl bg-gmtm-lime hover:bg-gmtm-lime-hover text-gmtm-sidebar font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-gmtm-sidebar border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((athlete) => (
            <div
              key={athlete.user_id}
              className="flex items-center justify-between p-4 rounded-xl bg-gmtm-bg border border-white/10 hover:border-gmtm-lime/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gmtm-lime/20 flex items-center justify-center text-gmtm-lime font-bold text-lg">
                  {athlete.first_name?.[0]}{athlete.last_name?.[0]}
                </div>
                <div>
                  <div className="font-semibold text-gmtm-text">
                    {athlete.first_name} {athlete.last_name}
                  </div>
                  <div className="text-sm text-gmtm-text-secondary">
                    {[athlete.position, athlete.graduation_year && `Class of ${athlete.graduation_year}`, athlete.city && athlete.state && `${athlete.city}, ${athlete.state}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLink(athlete)}
                disabled={isLinking}
                className="px-4 py-2 rounded-lg bg-gmtm-lime/10 border border-gmtm-lime/30 text-gmtm-lime font-medium text-sm hover:bg-gmtm-lime/20 transition-all disabled:opacity-50"
              >
                {isLinking ? 'Linking...' : "That's Me"}
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && query.length >= 2 && !isSearching && (
          <div className="text-center py-8 text-gmtm-text-secondary">
            No results yet. Hit search to find your profile.
          </div>
        )}

        {/* Skip option */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/chat')}
            className="text-sm text-gmtm-text-secondary hover:text-gmtm-text transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  )
}
