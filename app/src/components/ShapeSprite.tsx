import type { Color } from '../modes/color-shape/generator'
import type { Shape } from '../modes/shape-memory/generator'
import { COLOR_TOKENS } from './colorTokens'

interface ShapeSpriteProps {
  shape: Shape
  color: Color
  size?: number
  ariaLabel?: string
}

const STAR_POINTS =
  '50,5 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38'
const HEART_PATH =
  'M50 88 C 14 60, 8 32, 28 18 C 40 10, 50 22, 50 30 C 50 22, 60 10, 72 18 C 92 32, 86 60, 50 88 Z'

function clampSize(size: number | undefined): number {
  const value = typeof size === 'number' ? size : 96
  if (value < 32) return 32
  if (value > 256) return 256
  return value
}

export function ShapeSprite({
  shape,
  color,
  size,
  ariaLabel,
}: ShapeSpriteProps) {
  const px = clampSize(size)
  const fill = COLOR_TOKENS[color].hex
  const label = ariaLabel ?? `${color} ${shape}`

  return (
    <svg
      role="img"
      aria-label={label}
      width={px}
      height={px}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {shape === 'circle' && <circle cx={50} cy={50} r={45} fill={fill} />}
      {shape === 'square' && (
        <rect x={5} y={5} width={90} height={90} fill={fill} />
      )}
      {shape === 'triangle' && (
        <polygon points="50,5 95,95 5,95" fill={fill} />
      )}
      {shape === 'rectangle' && (
        <rect x={5} y={20} width={90} height={60} fill={fill} />
      )}
      {shape === 'star' && <polygon points={STAR_POINTS} fill={fill} />}
      {shape === 'heart' && <path d={HEART_PATH} fill={fill} />}
      {shape === 'diamond' && (
        <polygon points="50,5 95,50 50,95 5,50" fill={fill} />
      )}
      {shape === 'oval' && (
        <ellipse cx={50} cy={50} rx={45} ry={30} fill={fill} />
      )}
    </svg>
  )
}
