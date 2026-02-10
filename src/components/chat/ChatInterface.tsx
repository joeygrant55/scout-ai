'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatStore, Message } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { chatStream, saveSearch, StreamEvent } from '@/lib/api'
import { MessageBubble } from './MessageBubble'
import { AthleteCard } from './AthleteCard'
import { QuerySuggestions } from './QuerySuggestions'
import { AthleteProfilePanel } from '@/components/athletes/AthleteProfilePanel'

// Search stage definitions for visual feedback
const STAGE_INFO: Record<string, { icon: string; color: string; label: string }> = {
  parsing: {
    icon: '🔍',
    color: 'text-gmtm-purple',
    label: 'Analyzing Query',
  },
  connecting: {
    icon: '🔗',
    color: 'text-gmtm-purple',
    label: 'Connecting to AI',
  },
  thinking: {
    icon: '🧠',
    color: 'text-gmtm-purple',
    label: 'AI Thinking',
  },
  querying: {
    icon: '🗄️',
    color: 'text-gmtm-lime',
    label: 'Searching Database',
  },
  analyzing: {
    icon: '📊',
    color: 'text-gmtm-purple',
    label: 'Analyzing Schema',
  },
  processing: {
    icon: '⚙️',
    color: 'text-gmtm-lime',
    label: 'Processing Results',
  },
  complete: {
    icon: '✅',
    color: 'text-gmtm-lime',
    label: 'Complete',
  },
  error: {
    icon: '❌',
    color: 'text-gmtm-error',
    label: 'Error',
  },
}

// Loading indicator component with GMTM design
function SearchProgressIndicator({
  events,
  currentStage,
}: {
  events: StreamEvent[]
  currentStage: string
}) {
  const stageInfo = STAGE_INFO[currentStage] || STAGE_INFO.processing

  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gmtm-lime to-gmtm-lime/70 flex items-center justify-center flex-shrink-0 animate-pulse shadow-sm">
        <svg
          className="w-5 h-5 text-gmtm-sidebar"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <div className="flex-1 bg-white rounded-2xl rounded-tl-md border-2 border-gmtm-border shadow-card overflow-hidden">
        {/* Current Stage Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-gmtm-bg-secondary to-white border-b border-gmtm-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">{stageInfo.icon}</span>
            <span className={`font-semibold ${stageInfo.color}`}>{stageInfo.label}</span>
            <div className="flex gap-1.5 ml-2">
              <div className="w-2 h-2 bg-gmtm-lime rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gmtm-lime rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gmtm-lime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        {/* Event Stream */}
        <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
          {events.map((event, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 text-sm animate-slideIn ${
                idx === events.length - 1 ? 'opacity-100' : 'opacity-60'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span className="text-xs mt-0.5 text-gmtm-lime">
                {event.event === 'tool_start' && '▶'}
                {event.event === 'tool_complete' && '✓'}
                {event.event === 'thinking' && '💭'}
                {event.event === 'progress' && '→'}
                {event.event === 'start' && '🚀'}
              </span>
              <div className="flex-1">
                <span className="text-gmtm-text-secondary">{event.message}</span>
                {event.details && (
                  <div className="mt-1 text-xs text-gmtm-text-muted font-mono bg-gmtm-bg-tertiary rounded-lg px-2 py-1 overflow-x-auto">
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-gmtm-bg-tertiary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gmtm-lime to-gmtm-purple animate-progressPulse"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

export function ChatInterface() {
  const [inputValue, setInputValue] = useState('')
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([])
  const [currentStage, setCurrentStage] = useState('parsing')
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, isSearching, addMessage, setSearching, addSavedSearch } = useChatStore()
  const { token, user } = useAuthStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamEvents])

  const handleStreamEvent = (event: StreamEvent) => {
    setStreamEvents((prev) => [...prev, event])
    setCurrentStage(event.stage)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSearching || !token) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setStreamEvents([])
    setCurrentStage('parsing')

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    })

    setSearching(true)

    try {
      // Use streaming API
      const response = await chatStream(userMessage, token, handleStreamEvent, user?.gmtmUserId)

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: response.response || 'Search complete.',
        athletes: response.athletes || [],
        query: userMessage,
      })
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.',
      })
    } finally {
      setSearching(false)
      setStreamEvents([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleSaveSearch = async (message: Message) => {
    if (!token || !message.query) return

    try {
      const saved = await saveSearch(message.query, token)
      addSavedSearch({
        id: saved.id || Date.now().toString(),
        query: message.query,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  const showSuggestions = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {showSuggestions ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              {/* SPARQ Logo */}
              <div className="mx-auto mb-5">
                <Image
                  src="/sparq-logo-white.png"
                  alt="SPARQ"
                  width={200}
                  height={50}
                  className="h-12 w-auto mx-auto"
                  priority
                />
              </div>
              <h2 className="text-3xl font-bold text-gmtm-text mb-3">
                Talent Discovery
              </h2>
              <p className="text-gmtm-text-secondary max-w-lg mx-auto text-base leading-relaxed">
                AI-powered athlete search with real-time database queries.
                Find verified talent using natural language.
              </p>
            </div>
            <QuerySuggestions onSuggestionClick={handleSuggestionClick} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={index}>
                <MessageBubble message={message} />

                {/* Athlete Results */}
                {message.role === 'assistant' && message.athletes && message.athletes.length > 0 && (
                  <div className="mt-4 ml-12">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gmtm-text-secondary">
                        Found {message.athletes.length} athlete{message.athletes.length !== 1 ? 's' : ''}
                      </p>
                      {message.query && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveSearch(message)}
                          className="text-xs text-gmtm-text-secondary hover:text-gmtm-lime hover:bg-gmtm-lime/10"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                          Save Search
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {message.athletes.map((athlete, idx) => (
                        <AthleteCard
                          key={idx}
                          athlete={athlete}
                          onProfileClick={(userId) => setSelectedAthleteId(userId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Progress Indicator */}
            {isSearching && (
              <SearchProgressIndicator
                events={streamEvents}
                currentStage={currentStage}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gmtm-border bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for athletes... (e.g., 'running backs in Texas with sub-4.5 40')"
              disabled={isSearching}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !inputValue.trim()}>
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progressPulse {
          0%, 100% {
            opacity: 0.5;
            transform: translateX(-100%);
          }
          50% {
            opacity: 1;
            transform: translateX(0%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }

        .animate-progressPulse {
          animation: progressPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Athlete Profile Panel */}
      {selectedAthleteId && (
        <AthleteProfilePanel
          userId={selectedAthleteId}
          onClose={() => setSelectedAthleteId(null)}
          token={token || undefined}
        />
      )}
    </div>
  )
}
