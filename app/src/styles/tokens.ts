export const BREAKPOINTS = {
  sm: 375,
  md: 768,
  lg: 1280,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

export const CONTAINER_MAX_WIDTH = {
  sm: '100%',
  md: '720px',
  lg: '960px',
} as const

export const CONTAINER_PADDING = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

export const MIN_TAP_TARGET_PX = 44

export const MIN_BODY_FONT_PX = 16

export function mediaQueryAtLeast(key: BreakpointKey): string {
  return `(min-width: ${BREAKPOINTS[key]}px)`
}
