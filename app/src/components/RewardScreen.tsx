import { useEffect, useRef } from 'react'
import { useT } from '../i18n/useLocale'
import { useReducedMotion } from '../state/useReducedMotion'

export type GameMode = 'shape-memory' | 'color-shape' | 'math-match'

interface RewardScreenProps {
  mode: GameMode
  onPlayAgain: () => void
  onChooseAnother: () => void
}

const STAR_COUNT = 5
const STAR_PATH =
  'M12 2 L14.6 8.6 L21.5 9.2 L16.3 13.8 L17.8 20.6 L12 17 L6.2 20.6 L7.7 13.8 L2.5 9.2 L9.4 8.6 Z'

export function RewardScreen({
  mode,
  onPlayAgain,
  onChooseAnother,
}: RewardScreenProps) {
  const t = useT()
  const reducedMotion = useReducedMotion()
  const playAgainRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    playAgainRef.current?.focus()
  }, [])

  return (
    <section role="status" aria-labelledby="reward-title" data-mode={mode}>
      <h2 id="reward-title">{t('reward.title')}</h2>
      <div
        data-testid="reward-stars"
        data-animate={reducedMotion ? 'false' : 'true'}
        aria-hidden="true"
      >
        {Array.from({ length: STAR_COUNT }, (_, i) => (
          <svg
            key={i}
            width={24}
            height={24}
            viewBox="0 0 24 24"
            style={
              reducedMotion ? undefined : { animationDelay: `${i * 80}ms` }
            }
          >
            <path d={STAR_PATH} fill="currentColor" />
          </svg>
        ))}
      </div>
      <div>
        <button
          ref={playAgainRef}
          type="button"
          onClick={onPlayAgain}
        >
          {t('reward.playAgain')}
        </button>
        <button type="button" onClick={onChooseAnother}>
          {t('reward.chooseAnother')}
        </button>
      </div>
    </section>
  )
}
