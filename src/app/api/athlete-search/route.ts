import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.SCOUT_BACKEND_URL || 'https://focused-essence-production-9809.up.railway.app'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')

  if (!name || name.length < 2) {
    return NextResponse.json({ athletes: [] })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/scout/athlete/search?name=${encodeURIComponent(name)}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ athletes: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ athletes: [] })
  }
}
