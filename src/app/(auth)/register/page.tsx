'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

// SPARQ Logo Component
function SPARQLogo() {
  return (
    <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-gmtm-lime to-gmtm-lime/80 flex items-center justify-center shadow-lg shadow-gmtm-lime/20">
      <svg viewBox="0 0 32 32" className="w-12 h-12" fill="none">
        <path
          d="M6 18C6 12.5 10.5 8 16 8C21.5 8 26 12.5 26 18"
          stroke="#1e2433"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="26" cy="26" r="4" fill="#1e2433"/>
      </svg>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()
  const registerMutation = useMutation(api.auth.register)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organization: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await registerMutation({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organization: formData.organization || undefined,
      })

      setToken(result.token)
      setUser({
        user_id: 1,
        email: result.user.email,
        first_name: result.user.firstName,
        last_name: result.user.lastName,
        organization: result.user.organization,
      })
      router.push('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gmtm-bg-secondary to-gmtm-bg">
      <Card className="w-full max-w-md border-2 shadow-card-hover">
        <CardHeader className="text-center pb-2">
          <SPARQLogo />
          <CardTitle className="text-3xl font-bold text-gmtm-text">Join SPARQ</CardTitle>
          <CardDescription className="text-gmtm-text-secondary">
            Start discovering verified athletic talent
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-gmtm-error/10 border border-gmtm-error/20 text-gmtm-error text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gmtm-text">First Name</label>
                <Input
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gmtm-text">Last Name</label>
                <Input
                  name="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gmtm-text">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="coach@school.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gmtm-text">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gmtm-text">Organization (optional)</label>
              <Input
                name="organization"
                placeholder="University / High School"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gmtm-sidebar border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gmtm-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-gmtm-lime hover:text-gmtm-lime-hover transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
