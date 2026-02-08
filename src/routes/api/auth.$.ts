import { createFileRoute } from '@tanstack/react-router'
import { api } from '~/server/api/app'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => api.fetch(request),
    },
  },
})
