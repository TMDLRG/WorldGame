import { test, expect } from '@playwright/test'

/**
 * OAS-430-T2 — Assert no third-party hosts are contacted when loading the SPA
 * (NFR-SEC-01: zero third-party runtime hosts).
 */
test.describe('third-party network audit', () => {
  test('home records only same-origin requests', async ({ page, baseURL }) => {
    expect(baseURL).toBeTruthy()
    const origin = new URL(baseURL!).origin

    const externalHosts: string[] = []

    page.on('request', (req) => {
      let hostname: string
      try {
        hostname = new URL(req.url()).hostname
      } catch {
        return
      }
      const baseHost = new URL(origin).hostname
      if (hostname !== baseHost) {
        externalHosts.push(hostname)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(
      externalHosts,
      `unexpected third-party hosts: ${[...new Set(externalHosts)].join(', ')}`,
    ).toEqual([])
  })
})
