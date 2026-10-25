import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type RouterValue = {
  path: string
  navigate: (to: string, opts?: { replace?: boolean }) => void
  back: () => void
  depth: number
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname || '/')
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (to === window.location.pathname) return
    if (opts?.replace) window.history.replaceState({}, '', to)
    else window.history.pushState({}, '', to)
    setPath(to)
    setDepth((d) => d + 1)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const back = useCallback(() => window.history.back(), [])

  const value = useMemo(() => ({ path, navigate, back, depth }), [path, navigate, back, depth])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter fuera del RouterProvider')
  return ctx
}

/** Coincidencia simple con parámetros: '/lote/:id' */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const s = path.split('/').filter(Boolean)
  if (p.length !== s.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i])
    else if (p[i] !== s[i]) return null
  }
  return params
}
