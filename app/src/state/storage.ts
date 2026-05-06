export const STORAGE_KEYS = {
  locale: 'xswu.locale',
  ageBand: 'xswu.ageBand',
  lastMode: 'xswu.lastMode',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

function backend(): Storage | null {
  try {
    if (typeof globalThis === 'undefined') return null
    const ls = (globalThis as { localStorage?: Storage }).localStorage
    return ls ?? null
  } catch {
    return null
  }
}

function readRaw(key: string): string | null {
  const ls = backend()
  if (!ls) return null
  try {
    return ls.getItem(key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string): void {
  const ls = backend()
  if (!ls) return
  try {
    ls.setItem(key, value)
  } catch {
    // swallow quota / security errors
  }
}

function deleteRaw(key: string): void {
  const ls = backend()
  if (!ls) return
  try {
    ls.removeItem(key)
  } catch {
    // swallow
  }
}

export function getItem<T>(key: StorageKey, fallback: T): T {
  const raw = readRaw(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    deleteRaw(key)
    return fallback
  }
}

export function setItem<T>(key: StorageKey, value: T): void {
  try {
    writeRaw(key, JSON.stringify(value))
  } catch {
    // swallow circular json
  }
}

export function removeItem(key: StorageKey): void {
  deleteRaw(key)
}

export interface AllPreferences {
  locale: string | null
  ageBand: string | null
  lastMode: string | null
}

export function safeReadAll(): AllPreferences {
  return {
    locale: getItem<string | null>(STORAGE_KEYS.locale, null),
    ageBand: getItem<string | null>(STORAGE_KEYS.ageBand, null),
    lastMode: getItem<string | null>(STORAGE_KEYS.lastMode, null),
  }
}
