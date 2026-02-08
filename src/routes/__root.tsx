/// <reference types="vite/client" />
import * as React from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { DarkModeProvider, ToastProvider } from '@shared/saas-core/components/ui'
import { AnalyticsProvider } from '~/components/analytics/analytics-provider'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '~/components/error-boundary'
import { MobileNav } from '~/components/navigation/mobile-nav'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <ErrorBoundary>
        <DarkModeProvider>
          <AnalyticsProvider>
            <Outlet />
            <MobileNav />
            <Toaster position="top-right" richColors />
            <ToastProvider />
          </AnalyticsProvider>
        </DarkModeProvider>
      </ErrorBoundary>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' ? null : (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        )}
        <Scripts />
      </body>
    </html>
  )
}
