import { useCallback, useMemo, useRef, useState } from 'react'
import { useT } from '../../i18n/useLocale'
import { usePreferences, type AgeBand } from '../../state/usePreferences'
import { useReducedMotion } from '../../state/useReducedMotion'
import type { Shape } from '../shape-memory/generator'
import { generateRound, type CardSpec } from './generator'

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

type Phase = 'awaiting' | 'won'

interface ColorShapeBoardProps {
  seed?: number
  onComplete?: () => void
}

function isSameCard(a: CardSpec, b: CardSpec): boolean {
  return a.color === b.color && a.shape === b.shape
}

export function ColorShapeBoard({ seed = 0, onComplete }: ColorShapeBoardProps) {
  const t = useT()
  const { ageBand: pref } = usePreferences()
  const ageBand: AgeBand = pref ?? '4-5'
  const reducedMotion = useReducedMotion()

  const round = useMemo(() => generateRound(ageBand, seed), [ageBand, seed])

  const [promptIdx, setPromptIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('awaiting')
  const [lastIncorrectIdx, setLastIncorrectIdx] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const completedRef = useRef(false)

  const current = round.prompts[promptIdx]!

  const handlePick = useCallback(
    (i: number) => {
      if (phase === 'won') return
      const choice = current.choices[i]!
      if (isSameCard(choice, current.target)) {
        setLastIncorrectIdx(null)
        setFeedback('correct')
        const nextIdx = promptIdx + 1
        if (nextIdx >= round.prompts.length) {
          setPhase('won')
          if (!completedRef.current) {
            completedRef.current = true
            onComplete?.()
          }
        } else {
          setPromptIdx(nextIdx)
        }
      } else {
        setLastIncorrectIdx(i)
        setFeedback('incorrect')
      }
    },
    [phase, current, promptIdx, round.prompts.length, onComplete],
  )

  return (
    <main
      aria-labelledby="cs-title"
      data-age-band={ageBand}
      data-animate={reducedMotion ? 'false' : 'true'}
    >
      <h1 id="cs-title">{t('mode.colorShape')}</h1>
      <p data-testid="prompt">
        {t('prompt.colorShape', {
          color: current.target.color,
          shape: current.target.shape,
        })}
      </p>
      <div data-testid="cs-choices">
        {current.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${c.color} ${c.shape}`}
            data-incorrect={i === lastIncorrectIdx}
            onClick={() => handlePick(i)}
          >
            <span style={{ color: c.color }}>{GLYPH[c.shape]}</span>
          </button>
        ))}
      </div>
      <div data-testid="feedback" aria-live="polite">
        {feedback === 'correct'
          ? t('feedback.greatJob')
          : feedback === 'incorrect'
            ? t('feedback.tryAgain')
            : ''}
      </div>
    </main>
  )
}
