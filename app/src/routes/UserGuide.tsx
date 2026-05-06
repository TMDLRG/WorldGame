import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n/useLocale'

export function UserGuide() {
  const t = useT()
  const navigate = useNavigate()
  return (
    <main aria-labelledby="guide-title" className="xswu-container xswu-stack">
      <h1 id="guide-title">{t('guide.title')}</h1>

      <section aria-labelledby="guide-kids">
        <h2 id="guide-kids">{t('guide.kidsHeading')}</h2>
        <p>{t('guide.kidsWelcome')}</p>
        <p>{t('guide.kidsShapeMemory')}</p>
        <p>{t('guide.kidsColorShape')}</p>
        <p>{t('guide.kidsMath')}</p>
        <p>{t('guide.kidsHaveFun')}</p>
      </section>

      <section aria-labelledby="guide-parents">
        <h2 id="guide-parents">{t('guide.parentsHeading')}</h2>
        <p>{t('guide.parentsPrivacy')}</p>
        <p>{t('guide.parentsAgeBands')}</p>
        <p>{t('guide.parentsModes')}</p>
        <p>{t('guide.parentsAccessibility')}</p>
        <p>{t('guide.parentsLocalStorage')}</p>
      </section>

      <nav aria-label={t('reward.backHome')}>
        <button type="button" onClick={() => navigate('/')}>
          {t('reward.backHome')}
        </button>
      </nav>
    </main>
  )
}
