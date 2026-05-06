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
  rewrites?: { source: string; destination: string }[]
}

function loadVercelConfig(): VercelConfig {
  return JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as VercelConfig
}

describe('OAS-420-T2 Vercel immutable caching + SPA rewrite', () => {
  it('serves /assets/* with cache-control immutable, max-age=31536000', () => {
    const cfg = loadVercelConfig()
    const route = cfg.headers?.find((h) => h.source === '/assets/(.*)')
    expect(route, 'vercel.json must define headers for /assets/(.*)').toBeDefined()
    const cc = route!.headers.find((h) => h.key === 'Cache-Control')
    expect(cc?.value).toContain('immutable')
    expect(cc?.value).toContain('max-age=31536000')
  })

  it('rewrites SPA paths to /index.html', () => {
    const cfg = loadVercelConfig()
    const rw = cfg.rewrites?.find(
      (r) => r.source === '/(.*)' && r.destination === '/index.html',
    )
    expect(rw, 'vercel.json must rewrite /(.*) -> /index.html').toBeDefined()
  })
})
