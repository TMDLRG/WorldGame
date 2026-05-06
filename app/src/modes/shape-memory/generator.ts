import type { AgeBand } from '../../state/usePreferences'
import { mulberry32, shuffleInPlace } from './prng'

export type Shape =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'oval'

export const SHAPE_POOL: readonly Shape[] = [
  'circle',
  'square',
  'triangle',
  'rectangle',
  'star',
  'heart',
  'diamond',
  'oval',
]

export interface Round {
  pairs: number
  deck: Shape[]
}

const PAIRS_BY_BAND: Record<AgeBand, number> = {
  '4-5': 3,
  '6-7': 6,
  '8-9': 8,
}

export function generateRound(ageBand: AgeBand, seed: number): Round {
  const pairs = PAIRS_BY_BAND[ageBand]
  const rng = mulberry32(seed)

  const pool = SHAPE_POOL.slice()
  shuffleInPlace(pool, rng)
  const picked = pool.slice(0, pairs)

  const deck: Shape[] = []
  for (const shape of picked) {
    deck.push(shape, shape)
  }
  shuffleInPlace(deck, rng)

  return { pairs, deck }
}
