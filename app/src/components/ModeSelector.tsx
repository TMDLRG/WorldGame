import { useT } from '../i18n/useLocale'
import { usePreferences, type Mode } from '../state/usePreferences'

const MODES: readonly Mode[] = ['shapeMemory', 'colorShape', 'math']
const LABEL_KEY = {
  shapeMemory: 'mode.shapeMemory',
  colorShape: 'mode.colorShape',
  math: 'mode.math',
} as const

interface ModeSelectorProps {
  onPlay?: (mode: Mode) => void
}

export function ModeSelector({ onPlay }: ModeSelectorProps) {
  const t = useT()
  const { lastMode, setLastMode } = usePreferences()

  const handleSelect = (next: Mode) => {
    setLastMode(next)
    onPlay?.(next)
  }

  return (
    <div role="group" aria-label={t('home.modeLabel')}>
      {MODES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={lastMode === value}
          onClick={() => handleSelect(value)}
        >
          {t(LABEL_KEY[value])}
        </button>
      ))}
    </div>
  )
}
