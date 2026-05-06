import { useCallback, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useT } from '../i18n/useLocale'
import { ShapeMemoryBoard } from '../modes/shape-memory/ShapeMemoryBoard'
import { ColorShapeBoard } from '../modes/color-shape/ColorShapeBoard'
import { MathMatchBoard } from '../modes/math-match/MathMatchBoard'
import { RewardScreen, type GameMode } from '../components/RewardScreen'
import type { Mode } from '../state/usePreferences'
import { HomePage } from './HomePage'
import { UserGuide } from './UserGuide'

const MODE_TO_PATH: Record<Mode, string> = {
  shapeMemory: '/play/shape-memory',
  colorShape: '/play/color-shape',
  math: '/play/math-match',
}

const MODE_TO_REWARD: Record<Mode, GameMode> = {
  shapeMemory: 'shape-memory',
  colorShape: 'color-shape',
  math: 'math-match',
}

function HomeRoute() {
  const navigate = useNavigate()
  const handlePlay = (mode: Mode) => {
    navigate(MODE_TO_PATH[mode])
  }
  return <HomePage onPlay={handlePlay} />
}

interface ModeRouteProps {
  mode: Mode
  renderBoard: (props: {
    seed: number
    onComplete: () => void
  }) => React.ReactNode
}

function ModeRoute({ mode, renderBoard }: ModeRouteProps) {
  const t = useT()
  const navigate = useNavigate()
  const [seed, setSeed] = useState(0)
  const [phase, setPhase] = useState<'play' | 'reward'>('play')

  const handleComplete = useCallback(() => {
    setPhase('reward')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setSeed((s) => s + 1)
    setPhase('play')
  }, [])

  const handleBackHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  if (phase === 'reward') {
    return (
      <RewardScreen
        mode={MODE_TO_REWARD[mode]}
        onPlayAgain={handlePlayAgain}
        onChooseAnother={handleBackHome}
      />
    )
  }

  return (
    <>
      <nav aria-label={t('reward.backHome')}>
        <button type="button" onClick={handleBackHome}>
          {t('reward.backHome')}
        </button>
      </nav>
      {renderBoard({ seed, onComplete: handleComplete })}
    </>
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
        <Route
          path="/play/shape-memory"
          element={
            <ModeRoute
              mode="shapeMemory"
              renderBoard={({ seed, onComplete }) => (
                <ShapeMemoryBoard seed={seed} onComplete={onComplete} />
              )}
            />
          }
        />
        <Route
          path="/play/color-shape"
          element={
            <ModeRoute
              mode="colorShape"
              renderBoard={({ seed, onComplete }) => (
                <ColorShapeBoard seed={seed} onComplete={onComplete} />
              )}
            />
          }
        />
        <Route
          path="/play/math-match"
          element={
            <ModeRoute
              mode="math"
              renderBoard={({ seed, onComplete }) => (
                <MathMatchBoard seed={seed} onComplete={onComplete} />
              )}
            />
          }
        />
        <Route path="/help" element={<UserGuide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocaleProvider>
  )
}
