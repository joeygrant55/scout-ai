'use client'

import { useEffect, useState } from 'react'
import { getFullAthleteProfile, FullAthleteProfile } from '@/lib/api'
import { MetricsTable } from './MetricsTable'
import { HighlightsGrid } from './HighlightsGrid'
import { SocialLinks } from './SocialLinks'
import { NFLComparison } from './NFLComparison'

interface AthleteProfilePanelProps {
  userId: number
  onClose: () => void
  token?: string
}

// Avatar component with fallback handling
function Avatar({ avatarUrl, firstName, lastName }: { avatarUrl?: string; firstName: string; lastName: string }) {
  const initials = `${firstName[0]}${lastName[0]}`

  return (
    <div className="w-20 h-20 rounded-full bg-gmtm-bg-secondary flex items-center justify-center overflow-hidden border-2 border-gmtm-border flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-gmtm-text-muted">${initials}</span>`
          }}
        />
      ) : (
        <span className="text-2xl font-bold text-gmtm-text-muted">{initials}</span>
      )}
    </div>
  )
}

export function AthleteProfilePanel({ userId, onClose, token }: AthleteProfilePanelProps) {
  const [profile, setProfile] = useState<FullAthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError(null)
      try {
        const data = await getFullAthleteProfile(userId, token)
        setProfile(data)
      } catch (err) {
        setError('Failed to load athlete profile')
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, token])

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gmtm-border bg-gmtm-bg-secondary">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gmtm-text-secondary hover:text-gmtm-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Close
          </button>

          {profile && (
            <a
              href={profile.gmtm_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-gmtm-lime hover:text-gmtm-lime-hover transition-colors"
            >
              View on GMTM
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-gmtm-lime border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gmtm-text-muted">Loading profile...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-gmtm-error/10 border border-gmtm-error/20 rounded-xl p-4 text-center">
                <p className="text-gmtm-error text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm font-medium text-gmtm-lime hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {profile && !loading && (
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar
                  avatarUrl={profile.avatar_url}
                  firstName={profile.first_name}
                  lastName={profile.last_name}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gmtm-text truncate">
                    {profile.first_name} {profile.last_name}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-gmtm-text-secondary mt-1">
                    {(profile.city || profile.state) && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {[profile.city, profile.state].filter(Boolean).join(', ')}
                      </span>
                    )}

                    {profile.graduation_year && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        Class of {profile.graduation_year}
                      </span>
                    )}
                  </div>

                  {/* Social Links */}
                  {profile.social_profiles.length > 0 && (
                    <div className="mt-3">
                      <SocialLinks profiles={profile.social_profiles} />
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {profile.about && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gmtm-text-secondary uppercase tracking-wider">
                    About
                  </h3>
                  <p className="text-sm text-gmtm-text-secondary leading-relaxed">
                    {profile.about}
                  </p>
                </div>
              )}

              {/* SPARQ Metrics */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gmtm-text-secondary uppercase tracking-wider">
                  SPARQ Metrics
                </h3>
                <MetricsTable metrics={profile.metrics} />
              </div>

              {/* NFL Combine Comparison */}
              <NFLComparison userId={userId} token={token} />

              {/* Highlights */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gmtm-text-secondary uppercase tracking-wider">
                  Highlights
                </h3>
                <HighlightsGrid highlights={profile.highlights} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {profile && (
          <div className="px-6 py-4 border-t border-gmtm-border bg-gmtm-bg-secondary">
            <a
              href={profile.gmtm_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-gmtm-lime text-gmtm-sidebar text-center font-semibold rounded-xl hover:bg-gmtm-lime-hover transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Full Profile on GMTM
            </a>
          </div>
        )}
      </div>
    </>
  )
}
