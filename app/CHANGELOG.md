# Changelog

All notable changes to the XSWU app are documented here. Sprint identifiers
(OAS-###) link back to the orchestration board.

## [Unreleased]

### Added — i18n dictionaries v1.0.0 (2026-05-06, Sprint 3, OAS-429)

- Locked the en, hi, and es translation dictionaries at version **1.0.0**.
- Added `DICTIONARIES_VERSION = '1.0.0'` and `EXPECTED_KEY_COUNT` exports from
  `src/i18n/dictionaries/index.ts`.
- Added `src/i18n/dictionaries/lock.test.ts` enforcing full key parity, no
  missing translations, and CHANGELOG + README presence on every CI run.

### Changed — Hindi review pass (OAS-429-T1)

Reviewer alias: Sprint-3-Hindi-review.

- `mode.shapeMemory`: आकृति स्मरण → आकृति याद (literary → everyday).
- `mode.math`: गणित जोड़ → गणित मिलान (addition → match, aligns with English).
- `reward.backHome`: वापस होम → घर वापस (drops English loanword).

Audit trail: `audits/i18n/hi-review.csv`.

### Changed — Spanish review pass (OAS-429-T2)

Reviewer alias: Sprint-3-Spanish-review.

- `mode.math`: Suma rapida → Suma rápida.
- `language.en`: Ingles → Inglés.
- `language.es`: Espanol → Español.
- `prompt.math`: Cuanto es {expression}? → ¿Cuánto es {expression}?
- `feedback.tryAgain`: Intentalo otra vez → Inténtalo otra vez.
- `feedback.greatJob`: Muy bien! → ¡Muy bien!
- `reward.title`: Muy bien! → ¡Muy bien!

All seven revisions are Spanish orthography fixes (missing diacritics or
paired punctuation) flagged by the native-speaker review.

Audit trail: `audits/i18n/es-review.csv`.

### Added — Accessibility (OAS-427)

- Visible `:focus-visible` rings + `SkipLink` to `#main-content` (T1).
- `useAnnouncer()` + `<A11yAnnouncer>` polite live region (T2).
- `@axe-core/react` dev-only console reporter and a vitest harness in
  `src/a11y/axe.test.tsx` asserting zero serious / critical violations on
  HomePage, SkipLink, and A11yAnnouncer (T3).
- Remediation log at `audits/a11y-remediation.md`.

### Added — Responsive layout + reduced motion (OAS-428)

- Responsive grid tokens at 375 / 768 / 1280 px in `src/styles/tokens.ts` and
  `src/styles/layout.css` (T1).
- `useReducedMotion()` hook + global motion reset (T2).
- Per-locale Playwright visual QA at 375 px in en / hi / es captured to
  `audits/visual-qa/`. Twelve PNGs cover home + 3 mode placeholder routes; an
  additional three RewardScreen HTML snapshots cover the unrouted reward
  flow. Summary `visual-qa.json` records `noHorizontalOverflow=true` for every
  capture (T3).

### Fixed — Game routes mount real boards (2026-05-06, post-launch)

- `routes/AppRouter.tsx` no longer renders a placeholder for
  `/play/shape-memory`, `/play/color-shape`, `/play/math-match`. Each route now
  mounts the corresponding `ShapeMemoryBoard`, `ColorShapeBoard`, or
  `MathMatchBoard` and shows `RewardScreen` on completion (with Play again /
  Choose another game), plus a `Back home` affordance during play.
- `routes/AppRouter.test.tsx` updated from placeholder assertions to assert
  the real game UIs (grid, prompts, choice buttons) on every play route.

### Added — Launch & compliance (2026-05-06, OAS-430 / OAS-431)

- Source published to [github.com/TMDLRG/WorldGame](https://github.com/TMDLRG/WorldGame)
  (`main` branch).
- Production deployment via Vercel CLI (`npx vercel --prod` from `app/`).
- Playwright `e2e/third-party.spec.ts` asserts zero third-party network hosts
  on initial load (OAS-430-T2, NFR-SEC-01).
- CSP + HSTS contract remains enforced in CI via `src/config/vercel.csp.test.ts`
  (OAS-430-T3 / OAS-420-T2 lineage).
