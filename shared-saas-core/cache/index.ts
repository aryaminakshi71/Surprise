// Caching Utilities

import {revalidateTag, unstable_cache} from 'next/cache'

// ============================================================================
// Server-Side Caching (Next.js Cache API)
// ============================================================================

/**
 * Create a cached function with tags for revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    tags: string[]
    revalidate?: number | false
  }
) {
  return unstable_cache(fn, [], {
    revalidate: options.revalidate,
    tags: options.tags,
  })
}

/**
 * Revalidate a specific cache tag
 */
export function invalidateCacheTag(tag: string) {
  revalidateTag(tag)
}

/**
 * Revalidate multiple cache tags
 */
export function invalidateCacheTags(...tags: string[]) {
  tags.forEach(tag => revalidateTag(tag))
}
