import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAnnouncer } from './useAnnouncer'

describe('OAS-427-T2 useAnnouncer()', () => {
  it('returns { message, announce } with an empty initial message', () => {
    const { result } = renderHook(() => useAnnouncer())
    expect(result.current.message).toBe('')
    expect(typeof result.current.announce).toBe('function')
  })

  it('announce(text) updates the message synchronously', () => {
    const { result } = renderHook(() => useAnnouncer())
    act(() => {
      result.current.announce('Nice match')
    })
    expect(result.current.message).toBe('Nice match')
  })

  it('announcing the same text twice still flips the message so screen readers re-announce (zero-width separator trick)', () => {
    const { result } = renderHook(() => useAnnouncer())
    act(() => {
      result.current.announce('Try again')
    })
    const first = result.current.message
    act(() => {
      result.current.announce('Try again')
    })
    const second = result.current.message
    expect(first).toContain('Try again')
    expect(second).toContain('Try again')
    expect(second).not.toBe(first)
  })

  it('announce("") clears the live region', () => {
    const { result } = renderHook(() => useAnnouncer())
    act(() => {
      result.current.announce('Nice match')
    })
    expect(result.current.message).not.toBe('')
    act(() => {
      result.current.announce('')
    })
    expect(result.current.message).toBe('')
  })
})
