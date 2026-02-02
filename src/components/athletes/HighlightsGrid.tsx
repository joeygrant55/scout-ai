'use client'

import { useState } from 'react'
import { FilmHighlight } from '@/lib/api'

interface HighlightsGridProps {
  highlights: FilmHighlight[]
}

export function HighlightsGrid({ highlights }: HighlightsGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<FilmHighlight | null>(null)

  if (highlights.length === 0) {
    return (
      <div className="text-center py-6 text-gmtm-text-muted text-sm">
        No highlight videos available
      </div>
    )
  }

  // Show first 4 highlights in grid
  const displayHighlights = highlights.slice(0, 4)
  const remainingCount = highlights.length - 4

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gmtm-text-secondary">
            {highlights.length} video{highlights.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {displayHighlights.map((highlight) => (
            <button
              key={highlight.film_id}
              onClick={() => highlight.video_url && setSelectedVideo(highlight)}
              className="group relative aspect-video rounded-lg overflow-hidden bg-gmtm-bg-secondary border border-gmtm-border hover:border-gmtm-teal/50 transition-colors"
            >
              {highlight.thumbnail_url ? (
                <img
                  src={highlight.thumbnail_url}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gmtm-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gmtm-text ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">{highlight.title}</p>
              </div>
            </button>
          ))}
        </div>

        {remainingCount > 0 && (
          <p className="text-xs text-gmtm-text-muted text-center">
            +{remainingCount} more video{remainingCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="aspect-video">
              <video
                src={selectedVideo.video_url || undefined}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support video playback.
              </video>
            </div>

            <div className="p-3 bg-gmtm-bg">
              <h3 className="font-medium text-gmtm-text">{selectedVideo.title}</h3>
              {selectedVideo.published_on && (
                <p className="text-xs text-gmtm-text-muted mt-1">
                  Published: {new Date(selectedVideo.published_on).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
