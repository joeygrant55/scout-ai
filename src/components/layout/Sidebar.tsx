'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'

// SPARQ Logo Component - Image logo
function SPARQLogo() {
  return (
    <div className="flex items-center">
      <Image
        src="/sparq-logo-white.png"
        alt="SPARQ"
        width={120}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </div>
  )
}

// Navigation icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { savedSearches, clearMessages } = useChatStore()

  const handleNewChat = () => {
    clearMessages()
    router.push('/chat')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-gmtm-sidebar min-h-screen flex flex-col shadow-sidebar">
      {/* Logo & Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <SPARQLogo />
        <p className="text-gmtm-text-light text-xs mt-1 ml-10">Talent Discovery</p>
      </div>

      {/* New Search Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gmtm-lime hover:bg-gmtm-lime-hover text-gmtm-sidebar font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon />
          New Search
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {/* Discovery Section */}
        <p className="px-3 py-2 text-[11px] text-gmtm-text-light uppercase tracking-wider font-semibold">
          Discovery
        </p>

        <Link
          href="/chat"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1',
            pathname === '/chat'
              ? 'bg-gmtm-lime text-gmtm-sidebar font-semibold'
              : 'text-white/70 hover:bg-gmtm-sidebar-hover hover:text-white'
          )}
        >
          <SearchIcon />
          <span>Search</span>
        </Link>

        <Link
          href="/searches"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1',
            pathname === '/searches'
              ? 'bg-gmtm-lime text-gmtm-sidebar font-semibold'
              : 'text-white/70 hover:bg-gmtm-sidebar-hover hover:text-white'
          )}
        >
          <BookmarkIcon />
          <span>Saved Searches</span>
        </Link>

        {/* Recent Searches */}
        {savedSearches.length > 0 && (
          <>
            <p className="px-3 py-2 mt-6 text-[11px] text-gmtm-text-light uppercase tracking-wider font-semibold">
              Recent
            </p>
            <div className="space-y-0.5">
              {savedSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    clearMessages()
                    router.push('/chat')
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-gmtm-sidebar-hover rounded-lg truncate transition-all duration-200"
                  title={search.query}
                >
                  {search.query.length > 22 ? search.query.substring(0, 22) + '...' : search.query}
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gmtm-sidebar-hover transition-colors">
          <div className="w-9 h-9 rounded-full bg-gmtm-lime/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-gmtm-lime">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name || 'User'}
            </p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}
