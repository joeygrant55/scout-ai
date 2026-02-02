'use client'

import { useState, useEffect } from 'react'
import { getNFLComparison, NFLComparisonResponse, SPARQProfile } from '@/lib/api'

interface NFLComparisonProps {
  userId: number
  token?: string
}

// NFL logo SVG
const NFLLogo = () => (
  <svg viewBox="0 0 192 192" className="w-6 h-6">
    <path
      fill="#013369"
      d="M96 0C43 0 0 43 0 96s43 96 96 96 96-43 96-96S149 0 96 0z"
    />
    <path
      fill="#D50A0A"
      d="M96 16c44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80 35.8-80 80-80z"
    />
    <path
      fill="#FFFFFF"
      d="M96 32c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64z"
    />
    <text x="96" y="108" textAnchor="middle" fill="#013369" fontSize="40" fontWeight="bold" fontFamily="Arial">
      NFL
    </text>
  </svg>
)

// Get color classes for percentile - used for badges and progress bars
function getPercentileColor(percentile: number, forProgressBar = false): string {
  const colors = {
    elite: forProgressBar ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    high: forProgressBar ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    mid: forProgressBar ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
    low: forProgressBar ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    base: forProgressBar ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gray-200 text-gray-700'
  }

  if (percentile >= 90) return colors.elite
  if (percentile >= 75) return colors.high
  if (percentile >= 50) return colors.mid
  if (percentile >= 25) return colors.low
  return colors.base
}

// Get unit suffix for metric display
function getMetricUnit(metricName: string): string {
  return metricName.includes('Jump') ? '"' : 's'
}

export function NFLComparison({ userId, token }: NFLComparisonProps) {
  const [comparison, setComparison] = useState<NFLComparisonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true)
      setError(null)
      try {
        const data = await getNFLComparison(userId, 'WR', token)
        setComparison(data)
      } catch (err) {
        setError('Unable to load NFL comparison')
        console.error('NFL comparison error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [userId, token])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
          <div className="h-5 w-48 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !comparison) {
    return null // Silently fail - NFL comparison is optional enhancement
  }

  const metrics = Object.values(comparison.metrics)

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-red-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NFLLogo />
            <div>
              <h3 className="text-white font-bold text-sm">NFL COMBINE COMPARISON</h3>
              <p className="text-white/70 text-xs">vs {comparison.position} Prospects</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPercentileColor(comparison.overall_percentile)}`}>
            {comparison.overall_percentile}th PERCENTILE
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="px-6 py-4 border-b border-white/10">
        <p className="text-white font-medium text-sm leading-relaxed">
          {comparison.headline}
        </p>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        {metrics.map((metric) => (
          <div
            key={metric.metric_name}
            className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-medium">{metric.metric_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">
                  {metric.athlete_value}{getMetricUnit(metric.metric_name)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPercentileColor(metric.nfl_percentile)}`}>
                  {metric.nfl_percentile}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPercentileColor(metric.nfl_percentile, true)}`}
                style={{ width: `${metric.nfl_percentile}%` }}
              />
            </div>

            {/* Player comparisons */}
            {metric.better_than.length > 0 && (
              <p className="text-xs text-green-400">
                <span className="text-green-300">Faster than:</span> {metric.better_than.slice(0, 2).join(', ')}
              </p>
            )}
            {metric.similar_to.length > 0 && (
              <p className="text-xs text-blue-400">
                <span className="text-blue-300">Similar to:</span> {metric.similar_to.slice(0, 2).join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pro Comparison */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-900/50 to-red-900/50 border-t border-white/10">
        <p className="text-white/90 text-sm italic">
          "{comparison.pro_comparison}"
        </p>
      </div>

      {/* SPARQ Historical Comparison */}
      {comparison.sparq_comparison && comparison.sparq_comparison.similar_profiles.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
            NFL Players with Similar Athletic Profiles
          </h4>
          <div className="space-y-2">
            {comparison.sparq_comparison.similar_profiles.slice(0, 3).map((profile: SPARQProfile) => (
              <div
                key={profile.name}
                className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
              >
                <div>
                  <p className="text-white text-sm font-medium">{profile.name}</p>
                  <p className="text-white/50 text-xs">{profile.college} • {profile.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-bold">{profile.sparq_score}</p>
                  <p className="text-white/40 text-xs">SPARQ Score</p>
                </div>
              </div>
            ))}
          </div>
          {comparison.sparq_comparison.sparq_headline && (
            <p className="text-white/60 text-xs mt-3 text-center italic">
              {comparison.sparq_comparison.sparq_headline}
            </p>
          )}
        </div>
      )}

      {/* Share hint */}
      <div className="px-6 py-3 bg-white/5 text-center">
        <p className="text-white/50 text-xs">
          Screenshot and share your NFL comparison
        </p>
      </div>
    </div>
  )
}
