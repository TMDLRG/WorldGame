import { useLocale, useT } from '../i18n/useLocale'
import type { Locale } from '../i18n/t'
import { usePreferences } from '../state/usePreferences'

const LOCALES: readonly Locale[] = ['en', 'hi', 'es']
const LABEL_KEY = {
  en: 'language.en',
  hi: 'language.hi',
  es: 'language.es',
} as const

export function LanguageSelector() {
  const t = useT()
  const { locale, setLocale } = useLocale()
  const prefs = usePreferences()

  const handleSelect = (next: Locale) => {
    setLocale(next)
    prefs.setLocale(next)
  }

  return (
    <div role="radiogroup" aria-label={t('home.languageLabel')}>
      {LOCALES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={locale === value}
          onClick={() => handleSelect(value)}
        >
          {t(LABEL_KEY[value])}
        </button>
      ))}
    </div>
  )
}
