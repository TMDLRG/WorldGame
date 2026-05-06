import { useSyncExternalStore } from 'react'

/**
 * Mirrors the OS-level "prefers reduced motion" preference.
 *
 * Returns `true` when `(prefers-reduced-motion: reduce)` matches, and updates
 * live on `MediaQueryList` change events without reload. SSR and browsers
 * without `matchMedia` get the safe default (`false`, i.e. motion enabled).
 *
 * Components that animate must branch on this hook to provide a motion-off
 * path (instant state change, static badge, etc.). The global CSS reset in
 * `src/styles/layout.css` is defense in depth, not a substitute.
 */
const MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  try {
    return window.matchMedia(MEDIA_QUERY).matches
  } catch {
    return false
  }
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(notify: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  let mql: MediaQueryList
  try {
    mql = window.matchMedia(MEDIA_QUERY)
  } catch {
    return () => {}
  }
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', notify)
    return () => mql.removeEventListener('change', notify)
  }
  const legacyMql = mql as MediaQueryList & {
    addListener?: (cb: () => unknown) => void
    removeListener?: (cb: () => unknown) => void
  }
  legacyMql.addListener?.(notify)
  return () => {
    legacyMql.removeListener?.(notify)
  }
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
