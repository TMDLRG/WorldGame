import { en, type EnDict, type TranslationKey } from './dictionaries/en'
import { hi } from './dictionaries/hi'
import { es } from './dictionaries/es'

export type Locale = 'en' | 'hi' | 'es'
export type { TranslationKey }

const dictionaries: Record<Locale, Partial<Record<keyof EnDict, string>>> = {
  en,
  hi,
  es,
}

const warned = new Set<string>()

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = vars[key]
    return v === undefined ? match : String(v)
  })
}

export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const localeDict = dictionaries[locale] ?? en
  const localized = localeDict[key]
  if (typeof localized === 'string') {
    return interpolate(localized, vars)
  }

  const fallback = en[key]
  if (locale !== 'en' && import.meta.env.DEV) {
    const tag = `${locale}:${String(key)}`
    if (!warned.has(tag)) {
      warned.add(tag)
      console.warn('[i18n] missing key for locale', locale, key)
    }
  }
  return interpolate(fallback ?? String(key), vars)
}
