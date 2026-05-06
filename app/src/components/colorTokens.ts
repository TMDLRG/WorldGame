import type { Color } from '../modes/color-shape/generator'

export interface ColorToken {
  hex: string
  /** WCAG AA contrast (>=4.5:1) against #ffffff. */
  aaOnLight: boolean
  /** WCAG AA contrast (>=4.5:1) against #111111. */
  aaOnDark: boolean
}

export const COLOR_TOKENS: Record<Color, ColorToken> = {
  red: { hex: '#d32f2f', aaOnLight: true, aaOnDark: false },
  blue: { hex: '#1976d2', aaOnLight: true, aaOnDark: false },
  yellow: { hex: '#fbc02d', aaOnLight: false, aaOnDark: true },
  green: { hex: '#388e3c', aaOnLight: true, aaOnDark: false },
  orange: { hex: '#f57c00', aaOnLight: false, aaOnDark: true },
  purple: { hex: '#7b1fa2', aaOnLight: true, aaOnDark: false },
  pink: { hex: '#c2185b', aaOnLight: true, aaOnDark: false },
  brown: { hex: '#5d4037', aaOnLight: true, aaOnDark: false },
  black: { hex: '#111111', aaOnLight: true, aaOnDark: false },
  white: { hex: '#ffffff', aaOnLight: false, aaOnDark: true },
}
