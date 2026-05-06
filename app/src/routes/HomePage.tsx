import { Link } from 'react-router-dom'
import { useT } from '../i18n/useLocale'
import { LanguageSelector } from '../components/LanguageSelector'
import { AgeBandSelector } from '../components/AgeBandSelector'
import { ModeSelector } from '../components/ModeSelector'
import { SkipLink } from '../components/SkipLink'
import type { Mode } from '../state/usePreferences'

interface HomePageProps {
  onPlay?: (mode: Mode) => void
}

export function HomePage({ onPlay }: HomePageProps = {}) {
  const t = useT()
  return (
    <>
      <SkipLink />
      <main
        id="main-content"
        className="xswu-container xswu-stack"
        aria-labelledby="home-title"
        tabIndex={-1}
      >
        <h1 id="home-title">{t('home.title')}</h1>
        <p>{t('home.trustBanner')}</p>
        <LanguageSelector />
        <AgeBandSelector />
        <ModeSelector onPlay={onPlay} />
        <nav aria-label={t('guide.openLink')}>
          <Link to="/help">{t('guide.openLink')}</Link>
        </nav>
      </main>
    </>
  )
}
