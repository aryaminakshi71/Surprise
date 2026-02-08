import { NextRequest, NextResponse } from 'next/server';
import { authService, TokenPayload } from './auth-service';
import { cache } from '../cache/redis-cache';

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register', '/api/health'];
const IGNORE_PATHS = ['/_next', '/static', '/favicon', '/assets'];

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function authMiddleware(request: AuthenticatedRequest): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;

  for (const ignorePath of IGNORE_PATHS) {
    if (path.startsWith(ignorePath)) {
      return null;
    }
  }

  for (const publicPath of PUBLIC_PATHS) {
    if (path === publicPath || path.startsWith(publicPath + '/')) {
      return null;
    }
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get('accessToken')?.value;

  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No access token provided' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = authService.verifyAccessToken(token);
  
  if (!payload) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  request.user = payload;
  return null;
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest) => {
    const authError = await authMiddleware(request);
    if (authError) return authError;
    return handler(request);
  };
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limit: number = 100,
  windowMs: number = 60000
) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);
    const windowKey = Math.floor(now / windowMs);
    const rateLimitKey = `ratelimit:${ip}:${windowKey}`;
    
    try {
      // Use Redis INCR for atomic increment
      const current = await cache.get<number>(rateLimitKey) || 0;
      
      if (current >= limit) {
        return NextResponse.json(
          { error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' },
          { status: 429 }
        );
      }
      
      // Increment counter with TTL
      await cache.set(rateLimitKey, current + 1, windowSeconds);
    } catch (error) {
      // If Redis fails, log error but don't block the request
      console.error('Rate limit check failed:', error);
    }
    
    return handler(request);
  };
}

export function withCors(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const response = await handler(request);
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  };
}
