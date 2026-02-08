import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configuration for authentication endpoints
const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
  prefix: "auth-rate-limit",
  analytics: true,
  timeout: 1000,
});

/**
 * Extract IP address from request headers
 */
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Check rate limit and return result
 */
async function checkRateLimit(ratelimit: Ratelimit, identifier: string) {
  try {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open to avoid blocking legitimate traffic on Redis errors
    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: Date.now() + 60000,
    };
  }
}

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
          'Retry-After': String(rateLimitResult.retryAfter || 60),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      })
    }
  }

  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
