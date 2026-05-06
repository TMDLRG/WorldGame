# Visual QA at 375 px (en / hi / es)

This directory holds the per-locale visual QA artifacts captured for OAS-428-T3.

## Goal
Confirm that the UI renders without horizontal overflow at the canonical mobile
breakpoint (375 px) in all three supported locales — English (en), Hindi (hi),
and Spanish (es). The 375 px width is the minimum mobile viewport our responsive
grid (OAS-428-T1) targets.

## Tooling
- Capture: Playwright (chromium project, viewport 375 x 812).
- Run command: `npx playwright test` (run from `app/`).
- Web server: `npm run preview` (vite preview on port 4173).
- Locale switching is performed by clicking the language radiogroup buttons
  rendered by `LanguageSelector`. Buttons are addressed by their index within
  the radiogroup so the test does not need to know each locale's label.
- Reward screen capture: the RewardScreen component is not routed in the app
  yet, so its capture is produced by a JSDOM render written to
  `audits/visual-qa/reward-<locale>.html`. This is documented as a known
  limitation; a routed reward flow is in scope for the Sprint 4 launch sprint.

## Captures
Per `(route, locale)` pair we save one PNG (12 total) plus per-locale HTML
snapshots of the unrouted RewardScreen (3 total). The summary
`visual-qa.json` records the run timestamp, viewport, and per-capture
`scrollWidth` vs `clientWidth` so the contract can detect any horizontal
overflow regression in CI.

| Screen | Routes captured |
| --- | --- |
| Home | `/` |
| Shape Memory | `/play/shape-memory` |
| Color & Shape | `/play/color-shape` |
| Math Match | `/play/math-match` |
| Reward | JSDOM-rendered HTML snapshot |

## Pass criteria
- For every captured PNG, `scrollWidth <= clientWidth`, i.e. no horizontal
  scrollbar at 375 px.
- All localized strings render with full diacritics (Spanish á, é, í, ó, ú, ñ;
  Hindi conjuncts and matras).
- Tap targets (buttons in selectors and CTAs) remain >= 44 x 44 px (enforced by
  the `xswu-tappable` token in `src/styles/layout.css` and asserted in
  `src/styles/tokens.test.ts`).

## Reviewer sign-off
Reviewer pass — Sprint 3 visual QA. Reviewer alias: Sprint-3-Visual-QA.
Date: 2026-05-06.

When a defect is found, capture a follow-up ticket linked to OAS-428 with
`<locale>` and `<screen>` tags. Re-run this Playwright pass after fixing.
