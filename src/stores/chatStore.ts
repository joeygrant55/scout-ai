import { create } from 'zustand'
import { Athlete } from '@/lib/api'

export interface SavedSearch {
  id: string
  query: string
  createdAt: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  athletes?: Athlete[]
  query?: string
}

interface ChatState {
  messages: Message[]
  isSearching: boolean
  savedSearches: SavedSearch[]

  // Actions
  addMessage: (message: Message) => void
  setSearching: (searching: boolean) => void
  clearMessages: () => void
  setSavedSearches: (searches: SavedSearch[]) => void
  addSavedSearch: (search: SavedSearch) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSearching: false,
  savedSearches: [],

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  setSearching: (searching) => {
    set({ isSearching: searching })
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setSavedSearches: (searches) => {
    set({ savedSearches: searches })
  },

  addSavedSearch: (search) => {
    set((state) => ({
      savedSearches: [search, ...state.savedSearches],
    }))
  },
}))
