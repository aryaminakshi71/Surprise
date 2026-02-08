import { createFileRoute } from '@tanstack/react-router'
import { api } from '~/server/api/app'

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        return api.fetch(request)
      },
    },
  },
})
