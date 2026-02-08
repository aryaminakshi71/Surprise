import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { RouterClient } from '@orpc/server'
import type { router } from '~/server/orpc/router'

const baseURL =
  import.meta.env.VITE_PUBLIC_API_URL?.replace(/\/api$/, '') ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
const apiVersion = import.meta.env.VITE_PUBLIC_API_VERSION ?? '1'

const link = new RPCLink({
  url: `${baseURL}/api/rpc`,
  headers: {
    'x-api-version': apiVersion,
  },
  plugins: [
    new BatchLinkPlugin({
      exclude: ({ path }) => path[0] === 'sse',
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
})

export const orpcClient: RouterClient<typeof router> = createORPCClient(link)
export const orpc = createTanstackQueryUtils(orpcClient)
