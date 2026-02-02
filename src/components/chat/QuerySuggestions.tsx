'use client'

interface QuerySuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

// Category icons
const LeaderboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SpeedIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EventIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const SUGGESTIONS = [
  {
    category: 'SPARQ Leaderboard',
    icon: LeaderboardIcon,
    queries: [
      'Show me the SPARQ leaderboard - top performers',
      'Athletes with highest SPARQ scores',
      'Top 10 from Slide to Glory events',
    ],
  },
  {
    category: 'Speed & Explosiveness',
    icon: SpeedIcon,
    queries: [
      'Athletes with sub-4.5 40-yard dash from SPARQ combines',
      'Vertical jump over 40 inches - verified',
      'Fastest 40 times from Florida SPARQ events',
    ],
  },
  {
    category: 'Location Based',
    icon: LocationIcon,
    queries: [
      'SPARQ-verified athletes in Florida',
      'Texas athletes from All Sports Combine',
      'Utah athletes from Slide to Glory',
    ],
  },
  {
    category: 'Event Specific',
    icon: EventIcon,
    queries: [
      'Athletes from Tampa Bay Tech combine',
      'Show me All Sports Combine participants',
      'Top performers from SPARQ Rivalry Series',
    ],
  },
]

export function QuerySuggestions({ onSuggestionClick }: QuerySuggestionsProps) {
  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-gmtm-text-muted">
        Try one of these example searches:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SUGGESTIONS.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gmtm-lime/10 text-gmtm-lime">
                  <Icon />
                </div>
                <h3 className="text-xs font-semibold text-gmtm-text uppercase tracking-wider">
                  {section.category}
                </h3>
              </div>
              <div className="space-y-2">
                {section.queries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(query)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white border-2 border-gmtm-border text-sm text-gmtm-text-secondary hover:bg-gmtm-lime/5 hover:border-gmtm-lime/40 hover:text-gmtm-text transition-all duration-200 group"
                  >
                    <span className="group-hover:text-gmtm-text">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
