'use client'

import { Message } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-gmtm-sidebar'
            : 'bg-gradient-to-br from-gmtm-lime to-gmtm-lime/80'
        )}
      >
        {isUser ? (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path
              d="M5 14C5 10.1 8.1 7 12 7C15.9 7 19 10.1 19 14"
              stroke="#1e2433"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="19" cy="19" r="2.5" fill="#1e2433"/>
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-gmtm-sidebar text-white rounded-tr-md'
            : 'bg-white border-2 border-gmtm-border text-gmtm-text rounded-tl-md shadow-card'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
