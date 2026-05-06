import { useCallback, useState } from 'react'
import { getItem, setItem, STORAGE_KEYS } from './storage'
import type { Locale } from '../i18n/t'

const SUPPORTED_LOCALES = ['en', 'hi', 'es'] as const
const SUPPORTED_AGE_BANDS = ['4-5', '6-7', '8-9'] as const
const SUPPORTED_MODES = ['shapeMemory', 'colorShape', 'math'] as const

export type AgeBand = (typeof SUPPORTED_AGE_BANDS)[number]
export type Mode = (typeof SUPPORTED_MODES)[number]

function oneOf<T extends string>(
  allowed: readonly T[],
  value: unknown,
): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

function normalizeLocale(value: unknown): Locale {
  return oneOf(SUPPORTED_LOCALES, value) ?? 'en'
}

export interface PreferencesApi {
  locale: Locale
  ageBand: AgeBand | null
  lastMode: Mode | null
  setLocale: (next: Locale) => void
  setAgeBand: (next: AgeBand) => void
  setLastMode: (next: Mode) => void
}

export function usePreferences(): PreferencesApi {
  const [locale, setLocaleState] = useState<Locale>(() =>
    normalizeLocale(getItem<unknown>(STORAGE_KEYS.locale, null)),
  )
  const [ageBand, setAgeBandState] = useState<AgeBand | null>(() =>
    oneOf(SUPPORTED_AGE_BANDS, getItem<unknown>(STORAGE_KEYS.ageBand, null)),
  )
  const [lastMode, setLastModeState] = useState<Mode | null>(() =>
    oneOf(SUPPORTED_MODES, getItem<unknown>(STORAGE_KEYS.lastMode, null)),
  )

  const setLocale = useCallback((next: Locale) => {
    const normalized = normalizeLocale(next)
    setLocaleState(normalized)
    setItem(STORAGE_KEYS.locale, normalized)
  }, [])

  const setAgeBand = useCallback((next: AgeBand) => {
    const normalized = oneOf(SUPPORTED_AGE_BANDS, next)
    if (!normalized) return
    setAgeBandState(normalized)
    setItem(STORAGE_KEYS.ageBand, normalized)
  }, [])

  const setLastMode = useCallback((next: Mode) => {
    const normalized = oneOf(SUPPORTED_MODES, next)
    if (!normalized) return
    setLastModeState(normalized)
    setItem(STORAGE_KEYS.lastMode, normalized)
  }, [])

  return { locale, ageBand, lastMode, setLocale, setAgeBand, setLastMode }
}
