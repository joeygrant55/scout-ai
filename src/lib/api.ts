/**
 * Scout AI API Client
 * Handles all communication with the FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  organization?: string
}

export interface ChatResponse {
  response?: string
  message?: string
  interpretation?: string
  query: string
  conversation_id?: string
  athletes_found?: number
  athletes?: Athlete[]
  timestamp?: string
}

// Streaming event types for real-time updates
export type StreamEventType = 'start' | 'progress' | 'thinking' | 'tool_start' | 'tool_complete' | 'complete' | 'error'

export interface StreamEvent {
  event: StreamEventType
  message: string
  stage: string
  tool?: string
  details?: string
  result?: ChatResponse & { athletes: Athlete[] }
}

export interface Athlete {
  user_id: number
  first_name: string
  last_name: string
  graduation_year?: number
  city?: string
  state?: string
  position?: string
  sport?: string
  film_count: number
  profile_url: string
  avatar_url?: string
  metrics?: Record<string, string | number>
  // SPARQ-specific fields
  event_name?: string
  sparq_score?: number
  percentile?: number
}

// Full profile types
export interface AthleteMetric {
  name: string
  value: string
  sparq_score?: number
  percentile?: number
  event_name?: string
}

export interface FilmHighlight {
  film_id: number
  title: string
  thumbnail_url?: string
  video_url?: string
  published_on?: string
}

export interface SocialProfile {
  platform: string
  url: string
}

export interface FullAthleteProfile {
  user_id: number
  first_name: string
  last_name: string
  graduation_year?: number
  city?: string
  state?: string
  avatar_url?: string
  about?: string
  metrics: AthleteMetric[]
  highlights: FilmHighlight[]
  social_profiles: SocialProfile[]
  gmtm_profile_url: string
}

// NFL Comparison types
export interface NFLMetricComparison {
  metric_name: string
  athlete_value: number
  nfl_percentile: number
  better_than: string[]
  similar_to: string[]
  worse_than: string[]
}

export interface SPARQProfile {
  name: string
  college: string
  position: string
  sparq_score: number
  draft_class?: number
  similarity: number
}

export interface SPARQComparison {
  similar_profiles: SPARQProfile[]
  sparq_percentile?: number
  estimated_sparq?: number
  sparq_headline?: string
}

export interface NFLComparisonResponse {
  position: string
  overall_percentile: number
  metrics: Record<string, NFLMetricComparison>
  pro_comparison: string
  headline: string
  sparq_comparison?: SPARQComparison
}

// Backend format for saved searches
interface BackendSavedSearch {
  saved_search_id: number
  name: string
  query_text: string
  is_alert: boolean
  alert_frequency?: string
  last_result_count: number
  created_on: string
}

// Frontend format (matches chatStore)
export interface SavedSearch {
  id: string
  query: string
  createdAt: string
}

// Helper function for fetch with auth
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Merge with any existing headers from options
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  return response
}

// Auth API
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetchWithAuth('/scout/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  organization?: string
): Promise<LoginResponse> {
  const response = await fetchWithAuth('/scout/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      organization,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  return response.json()
}

export async function getMe(token: string): Promise<User> {
  const response = await fetchWithAuth('/scout/auth/me', {}, token)

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}

// Chat API
export async function chat(message: string, token?: string): Promise<ChatResponse> {
  const response = await fetchWithAuth(
    '/scout/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    token
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Chat request failed')
  }

  return response.json()
}

// Streaming Chat API using Server-Sent Events
export async function chatStream(
  message: string,
  token?: string,
  onEvent?: (event: StreamEvent) => void
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/scout/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Chat stream request failed')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let finalResult: ChatResponse | null = null

  if (!reader) {
    throw new Error('No response body')
  }

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')

    // Keep the last incomplete line in buffer
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()

        if (data === '[DONE]') {
          break
        }

        try {
          const event: StreamEvent = JSON.parse(data)
          if (onEvent) {
            onEvent(event)
          }

          // Store final result
          if (event.event === 'complete' && event.result) {
            finalResult = {
              response: event.result.response,
              query: event.result.query,
              athletes_found: event.result.athletes_found,
              athletes: event.result.athletes,
            }
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }

  return finalResult || { query: message, response: 'Search completed' }
}

// Athlete API
export async function getAthlete(userId: number, token?: string): Promise<Athlete> {
  const response = await fetchWithAuth(`/scout/athletes/${userId}`, {}, token)

  if (!response.ok) {
    throw new Error('Failed to get athlete profile')
  }

  return response.json()
}

export async function getFullAthleteProfile(
  userId: number,
  token?: string
): Promise<FullAthleteProfile> {
  const response = await fetchWithAuth(`/scout/athletes/${userId}/full`, {}, token)

  if (!response.ok) {
    throw new Error('Failed to get full athlete profile')
  }

  return response.json()
}

export async function getNFLComparison(
  userId: number,
  position: string = 'WR',
  token?: string
): Promise<NFLComparisonResponse> {
  const response = await fetchWithAuth(
    `/scout/athletes/${userId}/nfl-comparison?position=${position}`,
    {},
    token
  )

  if (!response.ok) {
    throw new Error('Failed to get NFL comparison')
  }

  return response.json()
}

// Saved Searches API
export async function getSavedSearches(token: string): Promise<SavedSearch[]> {
  const response = await fetchWithAuth('/scout/searches', {}, token)

  if (!response.ok) {
    throw new Error('Failed to get saved searches')
  }

  const data: BackendSavedSearch[] = await response.json()
  // Transform backend format to frontend format
  return (data || []).map((s) => ({
    id: String(s.saved_search_id),
    query: s.query_text,
    createdAt: s.created_on,
  }))
}

export async function saveSearch(
  queryText: string,
  token: string
): Promise<{ id: string }> {
  const response = await fetchWithAuth(
    '/scout/searches/save',
    {
      method: 'POST',
      body: JSON.stringify({
        name: queryText.substring(0, 50),
        query_text: queryText,
        is_alert: false,
      }),
    },
    token
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to save search')
  }

  const data = await response.json()
  return { id: String(data.saved_search_id || Date.now()) }
}

export async function deleteSearch(searchId: number, token: string): Promise<void> {
  const response = await fetchWithAuth(
    `/scout/searches/${searchId}`,
    { method: 'DELETE' },
    token
  )

  if (!response.ok) {
    throw new Error('Failed to delete search')
  }
}

export async function runSavedSearch(
  searchId: number,
  token: string
): Promise<ChatResponse> {
  const response = await fetchWithAuth(
    `/scout/searches/${searchId}/run`,
    { method: 'POST' },
    token
  )

  if (!response.ok) {
    throw new Error('Failed to run saved search')
  }

  const data = await response.json()
  return data.result
}
