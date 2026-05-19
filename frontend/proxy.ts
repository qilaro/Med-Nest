import { NextResponse, NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (!pathname.startsWith('/api/')) return response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  rateLimit(ip, 60, 10000)

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
