import posthog from 'posthog-js'

let initialized = false

export function initAnalytics() {
  if (initialized) return
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST
  if (key) {
    posthog.init(key, {
      api_host: host || 'https://us.i.posthog.com',
      capture_pageview: false,
    })
  }
  initialized = true
}

export function trackPageView(url: string) {
  if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) return
  posthog.capture('$pageview', { $current_url: url })
}
