import type { Locale } from './t'

export type NumeralSystem = 'western' | 'devanagari'

export interface FormatNumberOpts {
  numerals?: NumeralSystem
}

const DEVANAGARI_DIGITS: readonly string[] = [
  '०',
  '१',
  '२',
  '३',
  '४',
  '५',
  '६',
  '७',
  '८',
  '९',
]

const DEFAULT_NUMERALS: Record<Locale, NumeralSystem> = {
  en: 'western',
  es: 'western',
  hi: 'devanagari',
}

let warnedNonInteger = false
function warnOnceNonInteger(value: number): void {
  if (warnedNonInteger) return
  warnedNonInteger = true
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn(
        `[xswu] formatNumber: non-integer ${value} rounded; pass an integer to suppress this warning.`,
      )
    }
  } catch {
    // ignore
  }
}

export function formatNumber(
  value: number,
  locale: Locale,
  opts?: FormatNumberOpts,
): string {
  let n = value
  if (!Number.isInteger(n)) {
    warnOnceNonInteger(n)
    n = Math.round(n)
  }

  const system: NumeralSystem = opts?.numerals ?? DEFAULT_NUMERALS[locale]
  const negative = n < 0
  const abs = Math.abs(n)
  const western = String(abs)
  const body =
    system === 'devanagari'
      ? western
          .split('')
          .map((d) => DEVANAGARI_DIGITS[Number(d)] as string)
          .join('')
      : western
  return negative ? `-${body}` : body
}

export function __resetFormatNumberWarningForTests(): void {
  warnedNonInteger = false
}
