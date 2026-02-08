import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authRateLimit, getClientIp, checkRateLimit } from '../utils/rate-limit'

export async function proxy(request: NextRequest) {
  // Rate limit check for sensitive endpoints
  const pathname = request.nextUrl.pathname
  const sensitiveEndpoints = ['/login', '/register', '/api/auth/signin']
  
  if (sensitiveEndpoints.some(p => pathname.startsWith(p))) {
    const ip = getClientIp(request as any)
    const rateLimitResult = await checkRateLimit(authRateLimit, ip)
    
    if (!rateLimitResult.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      })
    }
  }

  const response = NextResponse.next()

  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.stripe.com https://*.googleapis.com wss://*.stripe.com",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self' https://*.stripe.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ')

  const headers = {
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': cspHeader,
    'X-XSS-Protection': '1; mode=block',
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
