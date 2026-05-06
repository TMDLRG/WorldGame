import { useT } from '../i18n/useLocale'
import { usePreferences, type AgeBand } from '../state/usePreferences'

const BANDS: readonly AgeBand[] = ['4-5', '6-7', '8-9']
const LABEL_KEY = {
  '4-5': 'ageBand.4-5',
  '6-7': 'ageBand.6-7',
  '8-9': 'ageBand.8-9',
} as const

export function AgeBandSelector() {
  const t = useT()
  const { ageBand, setAgeBand } = usePreferences()

  return (
    <div role="radiogroup" aria-label={t('home.ageBandLabel')}>
      {BANDS.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={ageBand === value}
          onClick={() => setAgeBand(value)}
        >
          {t(LABEL_KEY[value])}
        </button>
      ))}
    </div>
  )
}
