import { NextRequest, NextResponse } from 'next/server'
import { hashPin, generateToken } from '@/app/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const { pin } = (await req.json()) as { pin?: string }
    if (!pin) {
      return NextResponse.json({ error: 'PIN required' }, { status: 400 })
    }

    const storedHash = process.env.APP_PIN_HASH
    const secret = process.env.SESSION_SECRET
    if (!storedHash || !secret) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const pinHash = await hashPin(pin)
    if (pinHash !== storedHash) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const token = await generateToken(pinHash, secret)
    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
