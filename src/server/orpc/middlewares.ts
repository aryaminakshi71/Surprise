import { ORPCError, os } from '@orpc/server'
import { auth } from '../auth'
import type { ORPCContext } from './context'

const base = os.$context<ORPCContext>()

export const dbProviderMiddleware = base.middleware(async ({ context, next }) => {
  return next({
    context: {
      db: context.db,
    },
  })
})

export const requiredAuthMiddleware = base.middleware(async ({ context, next }) => {
  const session = context.session ?? (await auth.api.getSession({ headers: context.request.headers }))

  if (!session?.user) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: {
      session,
      user: session.user,
    },
  })
})

export const requiredOrgMiddleware = base.middleware(async ({ context, next }) => {
  const activeOrganizationId = context.session?.activeOrganizationId

  if (!activeOrganizationId) {
    throw new ORPCError('FORBIDDEN')
  }

  let organization: ORPCContext['organization'] = null
  try {
    const orgResult = await auth.api.getFullOrganization({
      query: { organizationId: activeOrganizationId },
      headers: context.request.headers,
    })
    organization = 'data' in orgResult ? (orgResult.data as ORPCContext['organization']) : (orgResult as ORPCContext['organization'])
  } catch (error) {
    console.error('Failed to load organization', error)
  }

  return next({
    context: {
      organizationId: activeOrganizationId,
      organization,
    },
  })
})

export const pub = base.use(dbProviderMiddleware)
export const authed = pub.use(requiredAuthMiddleware)
export const orgAuthed = authed.use(requiredOrgMiddleware)
