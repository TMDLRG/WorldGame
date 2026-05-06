# XSWU i18n dictionaries

This directory holds the locked-down translation dictionaries for the
application. Each dictionary is a flat object keyed by `TranslationKey`
(declared in `../t.ts`).

## Version

The dictionaries are tagged **v1.0.0** as of the close of Sprint 3
(Accessibility & Localization Polish). The version constant is exported from
`./index.ts`:

```
export const DICTIONARIES_VERSION = '1.0.0'
```

The dictionaries are now considered **locked** for Sprint 4 launch. Any change
that adds, removes, or renames a key is a breaking change and must:

1. Bump `DICTIONARIES_VERSION` (semver — patch for value-only edits, minor for
   key additions, major for key removals or renames).
2. Land an entry in `app/CHANGELOG.md` under a dated heading that lists the
   reviewer alias and the keys touched.
3. Pass `npm run i18n:parity`, which enforces full key parity between en, hi,
   and es and is gated by `src/i18n/dictionaries/lock.test.ts` in CI.

## Parity gate

The lock contract `src/i18n/dictionaries/lock.test.ts` asserts at every CI
run:

- `Object.keys(en) === Object.keys(hi) === Object.keys(es)` (full parity)
- Every value in `hi` and `es` is a non-empty string (no missing translations)
- `EXPECTED_KEY_COUNT` (29 as of v1.0.0) is honored across all three locales
- This README and the top-level `CHANGELOG.md` document the lock policy

## Adding a new locale

A new locale should be added to `./` as `<locale>.ts`, must export a
`Partial<Record<keyof EnDict, string>>` with all 29 keys filled in, and must be
re-exported from `./index.ts`. The parity gate, the per-locale review CSV
(see `audits/i18n/<locale>-review.csv`), and the per-locale Playwright visual
QA at 375 px (see `audits/visual-qa/`) should all be extended for the new
locale before merge.

## Reviewer trail (Sprint 3)

- Hindi pass — see `audits/i18n/hi-review.csv` (4 revisions, 25 approvals).
- Spanish pass — see `audits/i18n/es-review.csv` (7 diacritic / paired-
  punctuation fixes, 22 approvals).
- Final parity output — see `audits/i18n/parity-final.txt`.
