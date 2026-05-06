import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..', '..')
const ciPath = join(repoRoot, '.github', 'workflows', 'ci.yml')

interface Step {
  name?: string
  uses?: string
  run?: string
  with?: Record<string, unknown>
}
interface Job {
  'runs-on': string
  steps: Step[]
}
interface Workflow {
  name: string
  on: unknown
  jobs: Record<string, Job>
}

function loadWorkflow(): Workflow {
  return parse(readFileSync(ciPath, 'utf8')) as Workflow
}

describe('OAS-420-T3 GitHub Actions CI', () => {
  it('triggers on push and pull_request', () => {
    const wf = loadWorkflow()
    const triggers = wf.on as { push?: unknown; pull_request?: unknown } | string[] | string
    if (Array.isArray(triggers)) {
      expect(triggers).toContain('push')
      expect(triggers).toContain('pull_request')
    } else if (typeof triggers === 'object' && triggers !== null) {
      expect(Object.keys(triggers)).toEqual(expect.arrayContaining(['push', 'pull_request']))
    } else {
      throw new Error('on: must be object or array of triggers')
    }
  })

  it('pins Node via setup-node using .nvmrc or node-version', () => {
    const wf = loadWorkflow()
    const allSteps: Step[] = Object.values(wf.jobs).flatMap((j) => j.steps)
    const nodeStep = allSteps.find((s) => (s.uses ?? '').startsWith('actions/setup-node@'))
    expect(nodeStep, 'setup-node step is required').toBeDefined()
    const w = nodeStep!.with ?? {}
    const versionFile = w['node-version-file']
    const usesNvmrc = typeof versionFile === 'string' && versionFile.endsWith('.nvmrc')
    const usesPin = typeof w['node-version'] === 'string' || typeof w['node-version'] === 'number'
    expect(usesNvmrc || usesPin, 'must pin node via .nvmrc or node-version').toBe(true)
  })

  it('runs npm ci, lint, typecheck, build, and unit test commands', () => {
    const wf = loadWorkflow()
    const allRuns: string[] = Object.values(wf.jobs)
      .flatMap((j) => j.steps)
      .map((s) => (s.run ?? '').trim())
      .filter(Boolean)
    expect(allRuns.some((r) => r.includes('npm ci'))).toBe(true)
    expect(allRuns.some((r) => r.includes('npm run lint'))).toBe(true)
    expect(allRuns.some((r) => r.includes('npm run typecheck') || r.includes('tsc --noEmit'))).toBe(true)
    expect(allRuns.some((r) => r.includes('npm run build'))).toBe(true)
    expect(allRuns.some((r) => r.includes('npm test') || r.includes('vitest'))).toBe(true)
  })
})
