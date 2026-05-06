# Accessibility audit and remediation log

This file tracks every accessibility finding for XSWU. The Sprint 3 axe-core
audit is run by `src/a11y/axe.test.tsx` on every CI run; new findings are
appended here with a fix or an explicit ADR-backed deferral. Lighthouse JSON
reports for each screen live under `audits/lighthouse/<screen>.json`.

## Tooling

This audit pins to **axe-core v4.11.4**. The version is asserted in `src/a11y/axe.test.tsx` (`/axe-core\s+v?\d+\.\d+\.\d+/`) so any drift surfaces in CI before the recorded version mismatches the runtime library.

| Tool         | Version  | How invoked                                              |
| ------------ | -------- | -------------------------------------------------------- |
| axe-core     | v4.11.4  | `axe.run(container)` inside Vitest (`src/a11y/axe.test.tsx`) |
| jsdom        | matches Vitest setup | DOM provided by `vitest run --environment=jsdom` |
| Lighthouse   | v11+     | `npx @lhci/cli@0.13 collect` against a local production build (manual run; report JSON committed under `audits/lighthouse/`) |

## Audit configuration

`runOnly` is set to the WCAG 2.0 / 2.1 A and AA tags so we surface every standards-track violation without burning CI time on best-practice rules:

```ts
runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
```

The assertion only fails the build for `serious` or `critical` impacts. Moderate / minor findings are logged here for follow-up but do not block.

## Audited screens (Sprint 3)

| Screen           | Source                                          | axe verdict     | Notes                                                                                  |
| ---------------- | ----------------------------------------------- | --------------- | -------------------------------------------------------------------------------------- |
| HomePage         | `src/routes/HomePage.tsx`                       | 0 serious / 0 critical | SkipLink first; selectors expose role=radiogroup/group with aria-label; aria-pressed reflected on selected button. |
| SkipLink         | `src/components/SkipLink.tsx`                   | 0 serious / 0 critical | Localized via t('a11y.skipToMain'); points at #main-content; visually hidden until focus. |
| A11yAnnouncer    | `src/components/A11yAnnouncer.tsx`              | 0 serious / 0 critical | role=status, aria-live=polite, aria-atomic=true, .xswu-visually-hidden.                 |

Mode screens (Shape Memory, Color & Shape, Math Match) and the Reward screen
are owned by Sprint 2 (Claude). When those land in main, they will be added to
this table and the axe assertion test will be extended to cover them. The
remediation contract above applies to every new screen added.

## Findings + fixes

No serious or critical violations have been recorded against the surfaces
above as of 2026-05-06.

| Date       | Screen          | axe rule                  | Impact   | Fix or deferral                                  |
| ---------- | --------------- | ------------------------- | -------- | ------------------------------------------------ |
| 2026-05-06 | HomePage        | (none)                    | n/a      | Initial audit clean.                             |
| 2026-05-06 | SkipLink        | (none)                    | n/a      | Initial audit clean.                             |
| 2026-05-06 | A11yAnnouncer   | (none)                    | n/a      | Initial audit clean.                             |

## Process

1. Add a row to the Audited screens table when a new screen is added.
2. Extend `src/a11y/axe.test.tsx` with a render + audit case for that screen.
3. If a `serious` or `critical` violation surfaces, the test fails CI. Fix the violation in the same PR; record the rule, impact, and fix in the table above.
4. If a finding cannot be fixed immediately, file an ADR documenting the
   deferral and link it from this file. **Never disable an axe rule globally
   without an ADR.**
5. Remove the deferral row only when the underlying issue is fixed and a
   subsequent axe run shows zero violations.

## Color contrast policy

Color tokens that fail WCAG AA contrast (4.5:1 for normal text, 3:1 for large)
are replaced rather than waived. The current focus ring color
(`--xswu-focus-ring-color: #0a3a8c`) gives ~9.3:1 contrast against the body
background (`#ffffff`) and falls back to the system `Highlight` color under
`(forced-colors: active)`.
