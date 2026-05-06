import type { AgeBand } from '../../state/usePreferences'
import { mulberry32, shuffleInPlace } from '../shape-memory/prng'
import { SHAPE_POOL, type Shape } from '../shape-memory/generator'

export type Color =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white'

export const COLOR_POOL: readonly Color[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'orange',
  'purple',
  'pink',
  'brown',
  'black',
  'white',
]

export interface CardSpec {
  color: Color
  shape: Shape
}

export interface Prompt {
  target: CardSpec
  choices: CardSpec[]
}

export interface ColorShapeRound {
  prompts: Prompt[]
}

const CHOICES_BY_BAND: Record<AgeBand, number> = {
  '4-5': 3,
  '6-7': 4,
  '8-9': 5,
}

const PROMPTS_PER_ROUND = 6

function pickFrom<T>(rng: () => number, pool: readonly T[]): T {
  const idx = Math.floor(rng() * pool.length)
  return pool[idx] as T
}

function pickFromExcluding<T>(
  rng: () => number,
  pool: readonly T[],
  excluded: readonly T[],
): T {
  const filtered = pool.filter((p) => !excluded.includes(p))
  return pickFrom(rng, filtered)
}

function isSameCard(a: CardSpec, b: CardSpec): boolean {
  return a.color === b.color && a.shape === b.shape
}

function generateDistractor(
  rng: () => number,
  target: CardSpec,
): CardSpec {
  if (rng() < 0.5) {
    return {
      color: target.color,
      shape: pickFromExcluding(rng, SHAPE_POOL, [target.shape]),
    }
  }
  return {
    color: pickFromExcluding(rng, COLOR_POOL, [target.color]),
    shape: target.shape,
  }
}

function generatePrompt(
  rng: () => number,
  choicesCount: number,
  prevTarget: CardSpec | null,
): Prompt {
  let target: CardSpec
  do {
    target = {
      color: pickFrom(rng, COLOR_POOL),
      shape: pickFrom(rng, SHAPE_POOL),
    }
  } while (prevTarget !== null && isSameCard(target, prevTarget))

  const distractors: CardSpec[] = []
  const distractorsNeeded = choicesCount - 1
  let safety = 0
  while (distractors.length < distractorsNeeded) {
    safety++
    if (safety > 200) break
    const candidate = generateDistractor(rng, target)
    if (isSameCard(candidate, target)) continue
    if (distractors.some((d) => isSameCard(d, candidate))) continue
    distractors.push(candidate)
  }

  const choices = shuffleInPlace([target, ...distractors], rng)
  return { target, choices }
}

export function generateRound(
  ageBand: AgeBand,
  seed: number,
): ColorShapeRound {
  const rng = mulberry32(seed)
  const choicesCount = CHOICES_BY_BAND[ageBand]
  const prompts: Prompt[] = []
  let prev: CardSpec | null = null
  for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
    const p = generatePrompt(rng, choicesCount, prev)
    prompts.push(p)
    prev = p.target
  }
  return { prompts }
}
