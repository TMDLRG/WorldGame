import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ShapeSprite } from './ShapeSprite'
import { COLOR_TOKENS } from './colorTokens'
import { SHAPE_POOL, type Shape } from '../modes/shape-memory/generator'
import { COLOR_POOL, type Color } from '../modes/color-shape/generator'

const PRIMITIVE: Record<Shape, string> = {
  circle: 'circle',
  square: 'rect',
  triangle: 'polygon',
  rectangle: 'rect',
  star: 'polygon',
  heart: 'path',
  diamond: 'polygon',
  oval: 'ellipse',
}

describe('OAS-425-T3 ShapeSprite + colorTokens', () => {
  it('renders an SVG for every (shape, color) combination', () => {
    for (const shape of SHAPE_POOL) {
      for (const color of COLOR_POOL) {
        const { container, unmount } = render(
          <ShapeSprite shape={shape} color={color} />,
        )
        const svg = container.querySelector('svg')
        expect(svg, `svg for ${color} ${shape}`).not.toBeNull()
        unmount()
      }
    }
  })

  it('SVG has role="img"', () => {
    const { container } = render(<ShapeSprite shape="circle" color="red" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('img')
  })

  it('default aria-label is `${color} ${shape}` when no ariaLabel prop', () => {
    const { container } = render(<ShapeSprite shape="star" color="purple" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-label')).toBe('purple star')
  })

  it('custom ariaLabel prop overrides the default', () => {
    const { container } = render(
      <ShapeSprite shape="heart" color="red" ariaLabel="hearted" />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-label')).toBe('hearted')
  })

  it('size prop drives width and height attributes', () => {
    const { container } = render(
      <ShapeSprite shape="circle" color="red" size={128} />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('128')
    expect(svg?.getAttribute('height')).toBe('128')
  })

  it('size larger than 256 is clamped to 256', () => {
    const { container } = render(
      <ShapeSprite shape="circle" color="red" size={9999} />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('256')
  })

  it('size smaller than 32 is clamped to 32', () => {
    const { container } = render(
      <ShapeSprite shape="circle" color="red" size={1} />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
  })

  it('COLOR_TOKENS contains all 10 colors with hex codes', () => {
    expect(Object.keys(COLOR_TOKENS).sort()).toEqual([...COLOR_POOL].sort())
    for (const c of COLOR_POOL) {
      expect(COLOR_TOKENS[c as Color]?.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('each shape uses the expected SVG primitive element', () => {
    for (const shape of SHAPE_POOL) {
      const { container, unmount } = render(
        <ShapeSprite shape={shape} color="black" />,
      )
      const svg = container.querySelector('svg')
      const primitive = svg?.querySelector(PRIMITIVE[shape])
      expect(primitive, `${shape} should contain <${PRIMITIVE[shape]}>`).not.toBeNull()
      unmount()
    }
  })
})
