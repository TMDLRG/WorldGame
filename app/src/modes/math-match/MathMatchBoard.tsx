import { useCallback, useMemo, useRef, useState } from 'react'
import { useLocale, useT } from '../../i18n/useLocale'
import { formatNumber } from '../../i18n/formatNumber'
import { usePreferences, type AgeBand } from '../../state/usePreferences'
import { useReducedMotion } from '../../state/useReducedMotion'
import { generateRound, type MathPrompt, type Op } from './generator'

type Phase = 'awaiting' | 'won'

interface MathMatchBoardProps {
  seed?: number
  onComplete?: () => void
}

const OP_SYMBOL: Record<Exclude<Op, 'count'>, string> = {
  add: '+',
  sub: '−',
  mul: '×',
}

function expressionFor(
  prompt: MathPrompt,
  locale: 'en' | 'hi' | 'es',
): string {
  if (prompt.op === 'count') {
    return formatNumber(prompt.left, locale)
  }
  const left = formatNumber(prompt.left, locale)
  const right =
    typeof prompt.right === 'number' ? formatNumber(prompt.right, locale) : ''
  const sym = OP_SYMBOL[prompt.op]
  return `${left} ${sym} ${right}`
}

export function MathMatchBoard({ seed = 0, onComplete }: MathMatchBoardProps) {
  const t = useT()
  const { locale } = useLocale()
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
      const value = current.choices[i]!
      if (value === current.answer) {
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

  const expression = expressionFor(current, locale)

  return (
    <main
      aria-labelledby="mm-title"
      data-age-band={ageBand}
      data-animate={reducedMotion ? 'false' : 'true'}
    >
      <h1 id="mm-title">{t('mode.math')}</h1>
      <p data-testid="prompt">
        {t('prompt.math', { expression })}
      </p>
      <div data-testid="math-choices">
        {current.choices.map((value, i) => {
          const formatted = formatNumber(value, locale)
          return (
            <button
              key={i}
              type="button"
              aria-label={formatted}
              data-incorrect={i === lastIncorrectIdx}
              onClick={() => handlePick(i)}
            >
              {formatted}
            </button>
          )
        })}
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
