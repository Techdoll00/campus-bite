import { useEffect, useState } from 'react'

export interface Route {
  name: string
  id?: string
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/'
  const parts = raw.split('/').filter(Boolean)
  return { name: parts[0] ?? 'home', id: parts[1] }
}

export function go(path: string) {
  const next = `#${path}`
  if (window.location.hash === next) return
  window.location.hash = next
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
