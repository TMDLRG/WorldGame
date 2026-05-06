import type { Locale } from '../i18n/t'

export const CURRENT_SCHEMA_VERSION = 1 as const

export const PREF_FIELDS = [
  'schemaVersion',
  'locale',
  'ageBand',
  'lastMode',
] as const

const SUPPORTED_LOCALES = ['en', 'hi', 'es'] as const
const SUPPORTED_AGE_BANDS = ['4-5', '6-7', '8-9'] as const
const SUPPORTED_MODES = ['shapeMemory', 'colorShape', 'math'] as const

export type AgeBand = (typeof SUPPORTED_AGE_BANDS)[number]
export type Mode = (typeof SUPPORTED_MODES)[number]

export interface Prefs {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  locale: Locale
  ageBand: AgeBand | null
  lastMode: Mode | null
}

export function defaultPrefs(): Prefs {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    locale: 'en',
    ageBand: null,
    lastMode: null,
  }
}

function pickEnum<T extends string>(
  allowed: readonly T[],
  value: unknown,
): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

let warned = false
function warnOnce(reason: string): void {
  if (warned) return
  warned = true
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.warn(`[xswu] migratePrefs: ${reason} \u2014 falling back to defaults`)
  }
}

export function migratePrefs(raw: unknown): Prefs {
  if (!isObject(raw)) {
    if (raw !== null && raw !== undefined) warnOnce('non-object input')
    return defaultPrefs()
  }
  if (raw.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    warnOnce(`unknown schemaVersion=${String(raw.schemaVersion)}`)
    return defaultPrefs()
  }
  const out: Prefs = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    locale: pickEnum(SUPPORTED_LOCALES, raw.locale) ?? 'en',
    ageBand: pickEnum(SUPPORTED_AGE_BANDS, raw.ageBand),
    lastMode: pickEnum(SUPPORTED_MODES, raw.lastMode),
  }
  return out
}

export function __resetMigrationWarningForTests(): void {
  warned = false
}
