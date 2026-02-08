import { orpc } from '@orpc/client'
import type { router } from '~/server/orpc/router'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export const client = orpc<typeof router>({
  baseURL: `${getBaseURL()}/api/rpc`,
  headers: () => {
    // Add any custom headers here
    return {}
  },
})

// Export individual API modules for easier imports
export const {
  system,
  auth,
  org,
  parking,
} = client
