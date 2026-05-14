import { NextResponse, NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'python-requests', 'curl',
  'wget', 'go-http-client', 'java', 'libwww', 'perl', 'php',
  'ruby', 'scrapy', 'node', 'axios', 'aiohttp', 'httpx',
  'fetch', 'selenium', 'playwright', 'puppeteer', 'headless',
  'phantomjs', 'mechanize', 'htmlunit',
]

const HONEYPOT_PATHS = ['/api/honeypot', '/api/admin', '/api/debug', '/wp-admin', '/.env', '/api/secret']
const STATIC_APIS = ['/api/stats', '/api/drug-classes', '/api/drugs/companies', '/api/dosage-forms', '/api/popular', '/api/generic-classes']
const SENSITIVE_APIS = ['/api/drugs', '/api/generics', '/api/search', '/api/drugs/']

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isApi = pathname.startsWith('/api/')
  const response = NextResponse.next()

  // Security headers on all responses
  Object.entries(securityHeaders()).forEach(([key, value]) => response.headers.set(key, value))

  // Honeypot — instant 403
  if (HONEYPOT_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403, headers: securityHeaders() })
  }

  // For non-API requests, just set headers and return
  if (!isApi) return response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  // Tighter rate limit for sensitive APIs (drugs/search)
  const isSensitive = SENSITIVE_APIS.some(p => pathname.startsWith(p))
  if (!rateLimit(ip, isSensitive ? 25 : 30, 10000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: securityHeaders() })
  }

  // Simple bot detection
  const ua = req.headers.get('user-agent') || ''
  if (ua.length < 20 || BOT_PATTERNS.some(p => ua.toLowerCase().includes(p))) {
    if (!ua.includes('Googlebot') && !ua.includes('Bingbot') && !ua.includes('Slurp')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403, headers: securityHeaders() })
    }
  }

  // Cache static APIs
  if (STATIC_APIS.includes(pathname)) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
  }

  return response
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
    'Content-Security-Policy': process.env.NODE_ENV === 'production'
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
      : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self';",
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}