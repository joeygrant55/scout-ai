import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMetric(value: string | number, unit?: string): string {
  if (unit === 'seconds' || unit === 's') {
    return `${value}s`
  }
  if (unit === 'inches' || unit === 'in' || unit === '"') {
    return `${value}"`
  }
  if (unit === 'lbs' || unit === 'pounds') {
    return `${value} lbs`
  }
  return String(value)
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
