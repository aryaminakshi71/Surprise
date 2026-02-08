import { useRouter as useTanstackRouter, useRouterState } from '@tanstack/react-router'

export function useRouter() {
  const router = useTanstackRouter()
  return {
    push: (to: string) => router.navigate({ to }),
    replace: (to: string) => router.navigate({ to, replace: true }),
    prefetch: (to: string) => router.preloadRoute({ to }),
  }
}

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function useSearchParams() {
  const search = useRouterState({ select: (state) => state.location.search })
  return new URLSearchParams(search)
}
