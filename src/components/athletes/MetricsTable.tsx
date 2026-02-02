'use client'

import { AthleteMetric } from '@/lib/api'

interface MetricsTableProps {
  metrics: AthleteMetric[]
}

// Get percentile color based on value - using GMTM design system
function getPercentileColor(percentile?: number): string {
  if (!percentile) return 'bg-gmtm-bg-tertiary text-gmtm-text-muted'
  if (percentile >= 95) return 'bg-gmtm-purple/15 text-gmtm-purple border border-gmtm-purple/20'
  if (percentile >= 80) return 'bg-gmtm-lime/15 text-gmtm-sidebar border border-gmtm-lime/30'
  if (percentile >= 60) return 'bg-gmtm-info/10 text-gmtm-info'
  if (percentile >= 40) return 'bg-gmtm-warning/10 text-gmtm-warning'
  return 'bg-gmtm-bg-tertiary text-gmtm-text-secondary'
}

// Format metric name for display
function formatMetricName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MetricsTable({ metrics }: MetricsTableProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-6 text-gmtm-text-muted text-sm">
        No SPARQ metrics available
      </div>
    )
  }

  // Get event name from first metric that has one
  const eventName = metrics.find((m) => m.event_name)?.event_name

  return (
    <div className="space-y-3">
      {eventName && (
        <div className="flex items-center gap-2 text-xs text-gmtm-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Event: {eventName}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border-2 border-gmtm-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gmtm-bg-tertiary">
              <th className="text-left px-4 py-3 font-semibold text-gmtm-text text-xs uppercase tracking-wider">Metric</th>
              <th className="text-center px-4 py-3 font-semibold text-gmtm-text text-xs uppercase tracking-wider">Value</th>
              <th className="text-center px-4 py-3 font-semibold text-gmtm-purple text-xs uppercase tracking-wider">SPARQ</th>
              <th className="text-right px-4 py-3 font-semibold text-gmtm-text text-xs uppercase tracking-wider">Percentile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gmtm-border bg-white">
            {metrics.map((metric, idx) => (
              <tr key={idx} className="hover:bg-gmtm-lime/5 transition-colors">
                <td className="px-4 py-3 font-medium text-gmtm-text">
                  {formatMetricName(metric.name)}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gmtm-text">
                  {metric.value}
                </td>
                <td className="px-4 py-3 text-center">
                  {metric.sparq_score ? (
                    <span className="font-bold text-gmtm-purple">{metric.sparq_score}</span>
                  ) : (
                    <span className="text-gmtm-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {metric.percentile ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPercentileColor(metric.percentile)}`}>
                      {metric.percentile}th
                    </span>
                  ) : (
                    <span className="text-gmtm-text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
