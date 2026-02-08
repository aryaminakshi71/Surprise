import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [organizationClient()],
})

export const { signIn, signOut, signUp, useSession, useActiveOrganization } = authClient
