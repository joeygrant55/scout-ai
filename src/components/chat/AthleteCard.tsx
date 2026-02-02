'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Athlete } from '@/lib/api'

interface AthleteCardProps {
  athlete: Athlete
  onProfileClick?: (userId: number) => void
}

// Verified checkmark icon
const VerifiedIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

// Location pin icon
const LocationIcon = () => (
  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Film/video icon
const FilmIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

// Arrow icon
const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export function AthleteCard({ athlete, onProfileClick }: AthleteCardProps) {
  const location = [athlete.city, athlete.state].filter(Boolean).join(', ')

  // Build metrics from the metrics object
  const metricsDisplay = []
  if (athlete.metrics) {
    if (athlete.metrics['40 Yard Dash']) {
      metricsDisplay.push({ label: '40', value: athlete.metrics['40 Yard Dash'], unit: 's' })
    }
    if (athlete.metrics['Vertical Jump']) {
      metricsDisplay.push({ label: 'Vert', value: athlete.metrics['Vertical Jump'], unit: '"' })
    }
    if (athlete.metrics['5-10-5 Shuttle']) {
      metricsDisplay.push({ label: 'Shuttle', value: athlete.metrics['5-10-5 Shuttle'], unit: 's' })
    }
    if (athlete.metrics['Broad Jump']) {
      metricsDisplay.push({ label: 'Broad', value: athlete.metrics['Broad Jump'], unit: '"' })
    }
  }

  const handleClick = () => {
    if (onProfileClick && athlete.user_id) {
      onProfileClick(athlete.user_id)
    } else if (athlete.profile_url) {
      window.open(athlete.profile_url, '_blank')
    }
  }

  // Check if this is a SPARQ-verified athlete
  const isSparqVerified = athlete.event_name || athlete.sparq_score

  return (
    <Card
      className="cursor-pointer border-2 border-gmtm-border hover:border-gmtm-lime/50 hover:shadow-card-hover transition-all duration-200 bg-white"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSparqVerified
              ? 'bg-gradient-to-br from-gmtm-lime to-gmtm-lime/70 shadow-sm'
              : 'bg-gmtm-bg-tertiary'
          }`}>
            <span className={`text-lg font-bold ${isSparqVerified ? 'text-gmtm-sidebar' : 'text-gmtm-text-secondary'}`}>
              {athlete.first_name?.[0]}
              {athlete.last_name?.[0]}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gmtm-text truncate">
                {athlete.first_name} {athlete.last_name}
              </h3>
              {isSparqVerified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gmtm-lime text-gmtm-sidebar font-semibold flex-shrink-0 flex items-center gap-1">
                  <VerifiedIcon />
                  SPARQ
                </span>
              )}
              {athlete.graduation_year && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gmtm-sidebar/10 text-gmtm-sidebar font-medium flex-shrink-0">
                  '{String(athlete.graduation_year).slice(-2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gmtm-text-secondary mb-2">
              {athlete.position && (
                <span className="font-medium text-gmtm-text">{athlete.position}</span>
              )}
              {athlete.position && location && <span className="text-gmtm-text-muted">•</span>}
              {location && (
                <span className="flex items-center gap-1 truncate text-gmtm-text-secondary">
                  <LocationIcon />
                  {location}
                </span>
              )}
            </div>

            {/* SPARQ Score - Featured prominently in purple */}
            {athlete.sparq_score && (
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gmtm-purple/10 border border-gmtm-purple/20 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-gmtm-purple uppercase tracking-wide">SPARQ</span>
                  <span className="text-lg font-bold text-gmtm-purple">{athlete.sparq_score}</span>
                </div>
                {athlete.percentile && (
                  <span className="text-xs font-medium text-gmtm-text-secondary bg-gmtm-bg-secondary px-2 py-1 rounded">
                    Top {100 - athlete.percentile}%
                  </span>
                )}
              </div>
            )}

            {/* SPARQ Event Badge */}
            {athlete.event_name && !athlete.sparq_score && (
              <div className="mb-2 text-xs text-gmtm-text-secondary bg-gmtm-bg-secondary px-2 py-1 rounded-lg inline-flex items-center gap-1">
                <span className="text-gmtm-lime font-medium">Event:</span> {athlete.event_name}
              </div>
            )}

            {/* Metrics */}
            {metricsDisplay.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {metricsDisplay.map((metric, index) => (
                  <div
                    key={index}
                    className="text-xs px-2 py-1 rounded-md bg-gmtm-bg-tertiary text-gmtm-text-secondary"
                  >
                    <span className="text-gmtm-text-muted">{metric.label}:</span>{' '}
                    <span className="font-semibold text-gmtm-text">
                      {metric.value}
                      {metric.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Film Count */}
            {athlete.film_count != null && athlete.film_count > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gmtm-lime font-medium">
                <FilmIcon />
                {athlete.film_count} film{athlete.film_count !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="text-gmtm-text-muted flex-shrink-0 mt-3">
            <ArrowIcon />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
