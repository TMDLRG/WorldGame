import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')

interface VercelHeader {
  key: string
  value: string
}
interface VercelHeaderRule {
  source: string
  headers: VercelHeader[]
}
interface VercelConfig {
  headers?: VercelHeaderRule[]
}

function loadVercelConfig(): VercelConfig {
  return JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as VercelConfig
}

describe('OAS-420-T2 Vercel CSP (NFR-SEC-01)', () => {
  it('emits the exact strict CSP on every route', () => {
    const cfg = loadVercelConfig()
    const route = cfg.headers?.find((h) => h.source === '/(.*)')
    expect(route, 'vercel.json must define headers for /(.*)').toBeDefined()
    const csp = route!.headers.find((h) => h.key === 'Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp!.value).toBe(
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
    )
  })

  it('emits HSTS preload (max-age >= 15552000, includeSubDomains, preload)', () => {
    const cfg = loadVercelConfig()
    const route = cfg.headers?.find((h) => h.source === '/(.*)')
    const hsts = route?.headers.find((h) => h.key === 'Strict-Transport-Security')
    expect(hsts).toBeDefined()
    const m = /max-age=(\d+)/.exec(hsts!.value)
    expect(m).not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(15552000)
    expect(hsts!.value).toContain('includeSubDomains')
    expect(hsts!.value).toContain('preload')
  })
})
