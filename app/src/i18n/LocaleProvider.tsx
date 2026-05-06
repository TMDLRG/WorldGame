import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'
import { t, type Locale } from './t'

const SUPPORTED: readonly Locale[] = ['en', 'hi', 'es']

function normalize(input: string | null | undefined): Locale {
  if (input && (SUPPORTED as readonly string[]).includes(input)) {
    return input as Locale
  }
  return 'en'
}

interface ProviderProps {
  initialLocale?: Locale
  children: ReactNode
}

export function LocaleProvider({ initialLocale, children }: ProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => normalize(initialLocale))

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(normalize(next))
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => t(key, locale, vars),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
