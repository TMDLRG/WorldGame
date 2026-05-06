import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { ModeSelector } from './ModeSelector'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => { map.delete(k) },
    setItem: (k: string, v: string) => { map.set(k, String(v)) },
  }
}

let mem: Storage

beforeEach(() => {
  mem = memoryStorage()
  vi.stubGlobal('localStorage', mem)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('OAS-421-T2 ModeSelector', () => {
  it('renders three localized mode buttons inside a group labelled Mode', () => {
    const onPlay = vi.fn()
    render(
      <LocaleProvider initialLocale="en">
        <ModeSelector onPlay={onPlay} />
      </LocaleProvider>,
    )
    expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shape Memory' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Color & Shape' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Math Match' })).toBeInTheDocument()
  })

  it('persists lastMode and invokes onPlay with the selected mode id on click (single click from home)', () => {
    const onPlay = vi.fn()
    render(
      <LocaleProvider initialLocale="en">
        <ModeSelector onPlay={onPlay} />
      </LocaleProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Color & Shape' }))
    expect(JSON.parse(mem.getItem('xswu.lastMode')!)).toBe('colorShape')
    expect(onPlay).toHaveBeenCalledTimes(1)
    expect(onPlay).toHaveBeenCalledWith('colorShape')
  })

  it('marks the persisted lastMode as aria-pressed=true on first paint', () => {
    mem.setItem('xswu.lastMode', JSON.stringify('shapeMemory'))
    const onPlay = vi.fn()
    render(
      <LocaleProvider initialLocale="en">
        <ModeSelector onPlay={onPlay} />
      </LocaleProvider>,
    )
    expect(screen.getByRole('button', { name: 'Shape Memory' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Math Match' })).toHaveAttribute('aria-pressed', 'false')
  })
})
