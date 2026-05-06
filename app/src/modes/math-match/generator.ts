import type { AgeBand } from '../../state/usePreferences'
import { mulberry32, shuffleInPlace } from '../shape-memory/prng'

export type Op = 'count' | 'add' | 'sub' | 'mul'

export interface MathPrompt {
  left: number
  op: Op
  right?: number
  answer: number
  choices: number[]
}

export interface MathRound {
  prompts: MathPrompt[]
}

const PROMPTS_PER_ROUND = 5

interface BandConfig {
  ops: readonly Op[]
  answerMin: number
  answerMax: number
  choices: number
}

const CONFIG: Record<AgeBand, BandConfig> = {
  '4-5': { ops: ['count'], answerMin: 1, answerMax: 5, choices: 4 },
  '6-7': { ops: ['add', 'sub'], answerMin: 0, answerMax: 10, choices: 4 },
  '8-9': {
    ops: ['add', 'sub', 'mul'],
    answerMin: 0,
    answerMax: 20,
    choices: 5,
  },
}

const MUL_FACTORS = [2, 3, 5] as const

function pickInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function pickFrom<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T
}

function makePrompt(rng: () => number, cfg: BandConfig): MathPrompt {
  const op = pickFrom(rng, cfg.ops)
  let left: number
  let right: number | undefined
  let answer: number

  if (op === 'count') {
    left = pickInt(rng, 1, 5)
    answer = left
  } else if (op === 'add') {
    answer = pickInt(rng, cfg.answerMin, cfg.answerMax)
    left = pickInt(rng, 0, answer)
    right = answer - left
  } else if (op === 'sub') {
    left = pickInt(rng, cfg.answerMin, cfg.answerMax)
    right = pickInt(rng, 0, left)
    answer = left - right
  } else {
    // mul
    const f = pickFrom(rng, MUL_FACTORS)
    const m = pickInt(rng, 0, Math.floor(cfg.answerMax / f))
    left = m
    right = f
    answer = m * f
  }

  // Distractor pool: integers in [answerMin..answerMax] except answer
  const pool: number[] = []
  for (let n = cfg.answerMin; n <= cfg.answerMax; n++) {
    if (n !== answer) pool.push(n)
  }
  shuffleInPlace(pool, rng)
  const distractors = pool.slice(0, cfg.choices - 1)
  const choices = shuffleInPlace([answer, ...distractors], rng)

  return op === 'count'
    ? { left, op, answer, choices }
    : { left, op, right, answer, choices }
}

export function generateRound(ageBand: AgeBand, seed: number): MathRound {
  const cfg = CONFIG[ageBand]
  const rng = mulberry32(seed)
  const prompts: MathPrompt[] = []
  for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
    prompts.push(makePrompt(rng, cfg))
  }
  return { prompts }
}
