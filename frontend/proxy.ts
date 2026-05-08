import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'python-requests', 'curl',
  'wget', 'go-http-client', 'java', 'libwww', 'perl', 'php',
  'ruby', 'scrapy', 'node', 'axios', 'aiohttp', 'httpx',
  'fetch', 'selenium', 'playwright', 'puppeteer', 'headless',
  'phantomjs', 'mechanize', 'htmlunit',
]

export default clerkMiddleware((auth, req) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  // Rate limiting
  if (!rateLimit(ip, 60, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: securityHeaders() }
    )
  }

  // Bot detection
  const ua = req.headers.get('user-agent') || ''
  if (ua.length < 20 || BOT_PATTERNS.some(p => ua.toLowerCase().includes(p))) {
    // Allow known search engines
    if (!ua.includes('Googlebot') && !ua.includes('Bingbot') && !ua.includes('Slurp')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403, headers: securityHeaders() }
      )
    }
  }

  const response = NextResponse.next()
  Object.entries(securityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
})

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
    'Content-Security-Policy': "frame-ancestors 'self'",
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
