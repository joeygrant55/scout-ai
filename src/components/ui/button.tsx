'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gmtm-lime focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          // Variants - GMTM Design System
          variant === 'default' && 'bg-gmtm-lime text-gmtm-sidebar hover:bg-gmtm-lime-hover shadow-sm hover:shadow-md',
          variant === 'secondary' && 'bg-gmtm-sidebar text-white hover:bg-gmtm-sidebar-hover',
          variant === 'outline' && 'border-2 border-gmtm-border bg-white text-gmtm-text hover:border-gmtm-lime hover:bg-gmtm-lime/5',
          variant === 'ghost' && 'hover:bg-gmtm-bg-secondary text-gmtm-text-secondary hover:text-gmtm-text',
          variant === 'link' && 'text-gmtm-lime hover:text-gmtm-lime-hover underline-offset-4 hover:underline',
          // Sizes
          size === 'default' && 'h-10 px-5 py-2',
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
