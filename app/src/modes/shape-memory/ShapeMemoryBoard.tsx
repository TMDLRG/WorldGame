import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '../../i18n/useLocale'
import { usePreferences, type AgeBand } from '../../state/usePreferences'
import { useReducedMotion } from '../../state/useReducedMotion'
import { generateRound, type Shape } from './generator'

const MISMATCH_DELAY_MS = 1000

const GLYPH: Record<Shape, string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  rectangle: '▮',
  star: '★',
  heart: '♥',
  diamond: '◆',
  oval: '⬭',
}

type Phase = 'idle' | 'one_flipped' | 'resolving' | 'won'

interface ShapeMemoryBoardProps {
  seed?: number
  onComplete?: () => void
}

export function ShapeMemoryBoard({
  seed = 0,
  onComplete,
}: ShapeMemoryBoardProps) {
  const t = useT()
  const { ageBand: pref } = usePreferences()
  const ageBand: AgeBand = pref ?? '4-5'
  const reducedMotion = useReducedMotion()

  const round = useMemo(() => generateRound(ageBand, seed), [ageBand, seed])

  const [phase, setPhase] = useState<Phase>('idle')
  const [matched, setMatched] = useState<ReadonlySet<number>>(
    () => new Set<number>(),
  )
  const [firstIdx, setFirstIdx] = useState<number | null>(null)
  const [secondIdx, setSecondIdx] = useState<number | null>(null)
  const completedRef = useRef(false)

  const handleFlip = useCallback(
    (i: number) => {
      if (phase === 'won' || phase === 'resolving') return
      if (matched.has(i)) return

      if (phase === 'idle') {
        setFirstIdx(i)
        setPhase('one_flipped')
        return
      }

      // phase === 'one_flipped'
      if (i === firstIdx) return // rapid double-tap
      const aShape = round.deck[firstIdx as number]
      const bShape = round.deck[i]
      if (aShape === bShape) {
        const next = new Set(matched)
        next.add(firstIdx as number)
        next.add(i)
        setMatched(next)
        setFirstIdx(null)
        if (next.size === round.deck.length) {
          setPhase('won')
          if (!completedRef.current) {
            completedRef.current = true
            onComplete?.()
          }
        } else {
          setPhase('idle')
        }
      } else {
        setSecondIdx(i)
        setPhase('resolving')
      }
    },
    [phase, matched, firstIdx, round.deck, onComplete],
  )

  // Mismatch flip-back timer
  useEffect(() => {
    if (phase !== 'resolving') return
    const delay = reducedMotion ? 0 : MISMATCH_DELAY_MS
    const id = window.setTimeout(() => {
      setFirstIdx(null)
      setSecondIdx(null)
      setPhase('idle')
    }, delay)
    return () => window.clearTimeout(id)
  }, [phase, reducedMotion])

  const isRevealed = (i: number): boolean =>
    matched.has(i) || i === firstIdx || i === secondIdx

  return (
    <main aria-labelledby="shape-memory-title" data-age-band={ageBand}>
      <h1 id="shape-memory-title">{t('mode.shapeMemory')}</h1>
      <div
        aria-label={t('mode.shapeMemory')}
        data-grid-size={round.pairs}
        data-testid="shape-memory-grid"
      >
        {round.deck.map((shape, i) => {
          const revealed = isRevealed(i)
          return (
            <button
              key={i}
              type="button"
              aria-label={
                revealed
                  ? t('a11y.cardRevealed', { shape })
                  : t('a11y.cardFaceDown')
              }
              aria-pressed={revealed}
              disabled={phase === 'won'}
              onClick={() => handleFlip(i)}
            >
              {revealed ? GLYPH[shape] : ''}
            </button>
          )
        })}
      </div>
    </main>
  )
}
