import { createContext } from 'react'
import type { Locale, TranslationKey } from './t'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
