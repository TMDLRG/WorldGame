import { Route, Routes, useNavigate } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useT } from '../i18n/useLocale'
import type { Mode } from '../state/usePreferences'
import { HomePage } from './HomePage'

const MODE_TO_PATH: Record<Mode, string> = {
  shapeMemory: '/play/shape-memory',
  colorShape: '/play/color-shape',
  math: '/play/math-match',
}

const MODE_TITLE_KEY = {
  shapeMemory: 'mode.shapeMemory',
  colorShape: 'mode.colorShape',
  math: 'mode.math',
} as const

function HomeRoute() {
  const navigate = useNavigate()
  const handlePlay = (mode: Mode) => {
    navigate(MODE_TO_PATH[mode])
  }
  return <HomePage onPlay={handlePlay} />
}

function ModePlaceholder({ mode }: { mode: Mode }) {
  const t = useT()
  const navigate = useNavigate()
  return (
    <main aria-labelledby="mode-title">
      <h1 id="mode-title">{t(MODE_TITLE_KEY[mode])}</h1>
      <button type="button" onClick={() => navigate('/')}>
        {t('reward.backHome')}
      </button>
    </main>
  )
}

function NotFound() {
  const t = useT()
  const navigate = useNavigate()
  return (
    <main>
      <button type="button" onClick={() => navigate('/')}>
        {t('reward.backHome')}
      </button>
    </main>
  )
}

export function AppRouter() {
  return (
    <LocaleProvider initialLocale="en">
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/play/shape-memory" element={<ModePlaceholder mode="shapeMemory" />} />
        <Route path="/play/color-shape" element={<ModePlaceholder mode="colorShape" />} />
        <Route path="/play/math-match" element={<ModePlaceholder mode="math" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocaleProvider>
  )
}
