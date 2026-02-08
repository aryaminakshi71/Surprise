// Standardized API Response Utilities

import {NextResponse} from 'next/server'
import {ErrorCodes, type ErrorCode} from '../../types/api'

// ============================================================================
// Local Type Definitions (avoid conflicts)
// ============================================================================

interface ApiSuccess<T = unknown> {
  success: true
  data: T
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number; cursor?: string }
}

interface ApiErrorData {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
  validation?: { field: string; message: string; code: string }[]
}

interface ApiErrorResponse {
  success: false
  error: ApiErrorData
}

export type { ApiSuccess, ApiErrorResponse as ApiError }

type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse

// ============================================================================
// Success Responses
// ============================================================================

export function success<T>(data: T, meta?: ApiSuccess<T>['meta']): ApiSuccess<T> {
  return { success: true, data, ...(meta && {meta}) }
}

export function message(message: string, meta?: Record<string, unknown>): ApiSuccess<{ message: string; [key: string]: unknown }> {
  return { success: true, data: {message, ...(meta || {})} }
}

export function paginated<T>(items: T[], page: number, limit: number, total: number): ApiSuccess<T[]> {
  return { success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export function cursorPaginated<T>(items: T[], cursor?: string, hasMore: boolean = false): ApiSuccess<T[]> & { meta: { cursor?: string; hasMore: boolean } } {
  return { success: true, data: items, meta: { ...(cursor && {cursor}), hasMore } }
}

// ============================================================================
// Error Responses
// ============================================================================

export function error(code: ErrorCode, message: string, options?: { details?: Record<string, unknown>; validation?: { field: string; message: string; code: string }[] }): ApiErrorResponse {
  return { success: false, error: { code, message, ...(options?.details && {details: options.details}), ...(options?.validation && {validation: options.validation}) } }
}

export function validationError(validation: { field: string; message: string; code: string }[]): ApiErrorResponse {
  return error(ErrorCodes.VALIDATION_ERROR, 'Please check your input', {validation})
}

export function notFound(resource: string = 'Resource'): ApiErrorResponse {
  return error(ErrorCodes.NOT_FOUND, `${resource} not found`)
}

export function unauthorized(message: string = 'Please sign in to continue'): ApiErrorResponse {
  return error(ErrorCodes.UNAUTHORIZED, message)
}

export function forbidden(message: string = 'You do not have permission'): ApiErrorResponse {
  return error(ErrorCodes.FORBIDDEN, message)
}

export function conflict(message: string = 'This resource already exists'): ApiErrorResponse {
  return error(ErrorCodes.ALREADY_EXISTS, message)
}

export function rateLimited(message: string = 'Too many requests', retryAfter?: number): ApiErrorResponse & { headers?: Record<string, string> } {
  const response = error(ErrorCodes.RATE_LIMITED, message)
  return { ...response, headers: retryAfter ? {'Retry-After': String(retryAfter)} : undefined }
}

export function internalError(message: string = 'An unexpected error occurred'): ApiErrorResponse {
  return error(ErrorCodes.INTERNAL_ERROR, message)
}

export function unavailable(message: string = 'Service temporarily unavailable'): ApiErrorResponse {
  return error(ErrorCodes.SERVICE_UNAVAILABLE, message)
}

// ============================================================================
// HTTP Status Code Mapping
// ============================================================================

export function getStatusCode(response: ApiResponse<unknown>): number {
  if ('success' in response && response.success) return 200
  
  const errorCode = response.error.code
  const statusMap: Record<string, number> = {
    INVALID_CREDENTIALS: 401,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    TOKEN_EXPIRED: 401,
    TOKEN_INVALID: 401,
    REFRESH_TOKEN_INVALID: 401,
    ACCOUNT_LOCKED: 423,
    ACCOUNT_NOT_VERIFIED: 403,
    VALIDATION_ERROR: 400,
    MISSING_FIELD: 400,
    INVALID_FORMAT: 400,
    INVALID_VALUE: 400,
    NOT_FOUND: 404,
    ALREADY_EXISTS: 409,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    DATABASE_ERROR: 500,
    CONSENT_REQUIRED: 403,
    DATA_REQUEST_PENDING: 400,
    COMPLIANCE_ERROR: 400,
    NETWORK_ERROR: 500,
  }
  return statusMap[errorCode] || 400
}

// ============================================================================
// Next.js Response Helpers
// ============================================================================

export function json<T>(response: ApiResponse<T>, status?: number): NextResponse {
  const actualStatus = status ?? getStatusCode(response)
  const headers: Record<string, string> = {}
  if ('headers' in response && response.headers) {
    Object.assign(headers, response.headers)
  }
  return NextResponse.json(response, {status: actualStatus, headers})
}

export function successJson<T>(data: T, status: number = 200): NextResponse {
  return json(success(data), status)
}

export function errorJson(code: ErrorCode, message: string, status?: number, options?: { details?: Record<string, unknown>; validation?: { field: string; message: string; code: string }[] }): NextResponse {
  const response = error(code, message, options)
  return json(response, status || getStatusCode(response))
}

// ============================================================================
// Compatibility Helpers (legacy API response utilities)
// ============================================================================

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return successJson(data, status)
}

export function apiError(message: string, status: number = 400, code: ErrorCode = ErrorCodes.INTERNAL_ERROR): NextResponse {
  return errorJson(code, message, status)
}

export function apiPaginated<T>(items: T[], page: number, limit: number, total: number): NextResponse {
  return json(paginated(items, page, limit, total))
}

export function handleApiError(error: unknown): NextResponse {
  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; status?: number }
    if (err.code) {
      return errorJson(err.code as ErrorCode, err.message || getErrorMessage(err.code as ErrorCode), err.status)
    }
    if (err.message) {
      return errorJson(ErrorCodes.INTERNAL_ERROR, err.message)
    }
  }
  return errorJson(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred')
}

export type CacheOptions = { maxAge: number; staleWhileRevalidate?: number; private?: boolean }

export const cacheOptions: Record<string, CacheOptions> = {
  private: { maxAge: 30, staleWhileRevalidate: 60, private: true },
  privateShort: { maxAge: 5, staleWhileRevalidate: 10, private: true },
  public: { maxAge: 60, staleWhileRevalidate: 300, private: false },
  publicShort: { maxAge: 5, staleWhileRevalidate: 10, private: false },
}

export function withCache<T extends (...args: any[]) => Promise<Response> | Response>(handler: T, options?: CacheOptions): T {
  return (async (...args: Parameters<T>) => {
    const response = await handler(...args)
    if (response instanceof NextResponse && options) {
      const visibility = options.private ? 'private' : 'public'
      const maxAge = Math.max(0, options.maxAge ?? 0)
      const swr = Math.max(0, options.staleWhileRevalidate ?? 0)
      response.headers.set('Cache-Control', `${visibility}, max-age=${maxAge}, stale-while-revalidate=${swr}`)
    }
    return response
  }) as T
}

type Handler = (...args: any[]) => Promise<Response> | Response
const passthrough = <T extends Handler>(handler: T): T => handler

export const rateLimiters = {
  standard: passthrough,
  strict: passthrough,
  apiKey: passthrough,
  public: passthrough,
}

export async function logNextAudit(..._args: unknown[]): Promise<void> {
  return
}

// ============================================================================
// Error Message Helpers
// ============================================================================

export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Please sign in to continue',
    FORBIDDEN: 'You do not have permission to perform this action',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    TOKEN_INVALID: 'Invalid authentication token',
    REFRESH_TOKEN_INVALID: 'Session expired. Please sign in again.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    ACCOUNT_NOT_VERIFIED: 'Please verify your email address to continue.',
    VALIDATION_ERROR: 'Please check your input and try again',
    MISSING_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    INVALID_VALUE: 'Invalid value',
    NOT_FOUND: 'The requested resource was not found',
    ALREADY_EXISTS: 'This already exists',
    CONFLICT: 'There was a conflict',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    INTERNAL_ERROR: 'An unexpected error occurred',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
    DATABASE_ERROR: 'Database error',
    CONSENT_REQUIRED: 'Please accept the terms to continue',
    DATA_REQUEST_PENDING: 'A data request is already in progress',
    COMPLIANCE_ERROR: 'Compliance check failed',
    NETWORK_ERROR: 'Network error occurred',
  }
  return messages[code] || 'An error occurred'
}

// ============================================================================
// Request Deduplication & Caching
// ============================================================================

const pendingRequests = new Map<string, Promise<ApiResponse<unknown>>>()
const responseCache = new Map<string, { data: unknown; expires: number }>()

export interface FetchOptions {
  timeout?: number
  retries?: number
  cacheTTL?: number
}

export async function fetchApi<T = unknown>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { timeout = 30000, retries = 0, cacheTTL = 60000 } = options
  const cacheKey = `GET:${url}`
  
  const cached = responseCache.get(cacheKey)
  if (cached && Date.now() < cached.expires) {
    return { success: true, data: cached.data } as ApiResponse<T>
  }
  
  const existingRequest = pendingRequests.get(cacheKey)
  if (existingRequest) return existingRequest as Promise<ApiResponse<T>>
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  const makeRequest = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      pendingRequests.delete(cacheKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: { code: ErrorCodes.INTERNAL_ERROR, message: errorData.message || response.statusText } } as ApiResponse<T>
      }
      
      const data = await response.json()
      responseCache.set(cacheKey, { data, expires: Date.now() + cacheTTL })
      return { success: true, data } as ApiResponse<T>
    } catch (error) {
      pendingRequests.delete(cacheKey)
      return { success: false, error: { code: ErrorCodes.NETWORK_ERROR, message: String(error) } } as ApiResponse<T>
    }
  }
  
  const requestPromise = makeRequest()
  pendingRequests.set(cacheKey, requestPromise)
  
  if (retries > 0) {
    return requestPromise.catch(async () => {
      for (let i = 0; i < retries; i++) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 100))
        try {
          return await makeRequest()
        } catch {}
      }
      return requestPromise
    })
  }
  
  return requestPromise
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    responseCache.clear()
    return
  }
  const keys = Array.from(responseCache.keys())
  for (const key of keys) {
    if (key.includes(pattern)) responseCache.delete(key)
  }
}
