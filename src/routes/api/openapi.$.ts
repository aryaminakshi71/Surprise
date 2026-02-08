import { createFileRoute } from '@tanstack/react-router'
import { api } from '~/server/api/app'

export const Route = createFileRoute('/api/openapi/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => api.fetch(request),
    },
  },
})
