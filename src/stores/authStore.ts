import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  organization?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      // Simple auth check - just verify we have token and user
      checkAuth: () => {
        const { token, user } = get()
        if (token && user) {
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false })
        }
      },
    }),
    {
      name: 'scout-ai-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      }),
    }
  )
)
