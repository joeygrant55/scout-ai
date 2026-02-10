'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()
  const loginMutation = useMutation(api.auth.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await loginMutation({ email, password })

      setToken(result.token)
      setUser({
        user_id: result.user.gmtmUserId ?? 0,
        email: result.user.email,
        first_name: result.user.firstName,
        last_name: result.user.lastName,
        organization: result.user.organization,
        gmtmUserId: result.user.gmtmUserId,
      })

      // If profile is linked, go to chat. Otherwise, connect first.
      if (result.user.gmtmUserId) {
        router.push('/chat')
      } else {
        router.push('/connect')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gmtm-bg-secondary to-gmtm-bg">
      <Card className="w-full max-w-md border-2 shadow-card-hover">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Image
              src="/sparq-logo-white.png"
              alt="SPARQ"
              width={160}
              height={40}
              className="h-10 w-auto mx-auto"
              priority
            />
          </div>
          <CardDescription className="text-gmtm-text-secondary">
            Talent discovery for coaches and scouts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-gmtm-error/10 border border-gmtm-error/20 text-gmtm-error text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gmtm-text">Email</label>
              <Input
                type="email"
                placeholder="coach@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gmtm-text">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gmtm-sidebar border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gmtm-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-gmtm-lime hover:text-gmtm-lime-hover transition-colors">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
