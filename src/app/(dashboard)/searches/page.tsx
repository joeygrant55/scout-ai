'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore, SavedSearch } from '@/stores/chatStore'
import { getSavedSearches } from '@/lib/api'

export default function SavedSearchesPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const { savedSearches, setSavedSearches, addMessage, clearMessages } = useChatStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSearches = async () => {
      if (!token) return
      try {
        const searches = await getSavedSearches(token)
        setSavedSearches(searches)
      } catch (error) {
        console.error('Failed to fetch saved searches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearches()
  }, [token, setSavedSearches])

  const handleRunSearch = (search: SavedSearch) => {
    clearMessages()
    addMessage({
      role: 'user',
      content: search.query,
    })
    router.push('/chat')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gmtm-text mb-2">Saved Searches</h1>
        <p className="text-gmtm-text-secondary">
          Quickly re-run your previous talent searches
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-gmtm-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : savedSearches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gmtm-bg-secondary flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gmtm-text-muted"
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
            </div>
            <h3 className="text-lg font-medium text-gmtm-text mb-2">
              No saved searches yet
            </h3>
            <p className="text-gmtm-text-secondary mb-6">
              Save a search from the chat to quickly access it later
            </p>
            <Button onClick={() => router.push('/chat')}>Start Searching</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <Card
              key={search.id}
              className="hover:border-gmtm-teal/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gmtm-text font-medium truncate">
                      {search.query}
                    </p>
                    <p className="text-sm text-gmtm-text-muted mt-1">
                      Saved {formatDate(search.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunSearch(search)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
