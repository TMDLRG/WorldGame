import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/layout.css'
import App from './App.tsx'

if (import.meta.env.DEV) {
  void (async () => {
    const [{ default: React }, { default: ReactDOM }, { default: axeReact }] =
      await Promise.all([
        import('react'),
        import('react-dom'),
        import('@axe-core/react'),
      ])
    axeReact(React, ReactDOM, 1000, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    })
  })()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
