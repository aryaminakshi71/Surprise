import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { initAnalytics } from './lib/analytics'
import { initSentry } from './lib/sentry'
import { registerServiceWorker } from './lib/service-worker'

initSentry()
initAnalytics()
registerServiceWorker()

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  )
})
