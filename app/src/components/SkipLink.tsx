import { useT } from '../i18n/useLocale'

interface SkipLinkProps {
  targetId?: string
}

export function SkipLink({ targetId = 'main-content' }: SkipLinkProps = {}) {
  const t = useT()
  return (
    <a className="xswu-skip-link" href={`#${targetId}`}>
      {t('a11y.skipToMain')}
    </a>
  )
}
