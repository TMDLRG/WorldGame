# `src/state` — Preferences storage and migrations

This module owns local-only preferences for XSWU. It is intentionally tiny:
it MUST NOT contain anything beyond what is required to remember a child's
last selections in the home screen, and it MUST NOT collect or persist any
Personally Identifiable Information (PII).

## Storage layout (decision: three keys + a schema version key)

We keep three independent keys plus a single schema-version key. This keeps
write paths atomic and the data model readable in DevTools without a
JSON-decode step.

| Key                  | Type    | Purpose                                  |
| -------------------- | ------- | ---------------------------------------- |
| `xswu.locale`        | string  | UI locale: `en` \| `hi` \| `es`           |
| `xswu.ageBand`       | string  | Age group: `4-5` \| `6-7` \| `8-9`        |
| `xswu.lastMode`      | string  | Last-played mode id                      |
| `xswu.schemaVersion` | integer | Schema version of the above (currently 1)|

All keys are strict-namespaced under `xswu.*`. Anything outside that
namespace is not ours and must not be read or written by this module.

## Allow-list (PII guard)

The full `Prefs` shape is defined by `PREF_FIELDS` in `migrations.ts`:

```ts
export const PREF_FIELDS = [
  'schemaVersion',
  'locale',
  'ageBand',
  'lastMode',
] as const
```

No other fields are allowed in the schema, ever. A unit test in
`migrations.test.ts` asserts that `migratePrefs` strips any extra keys
(including any PII a future caller may try to smuggle in) so the on-disk
shape stays minimal.

## Migration policy: forward-only, defaults on unknown

`migratePrefs(raw)` is a pure, total function that:

1. Returns `defaultPrefs()` for `null`, `undefined`, or non-object inputs.
2. Returns `defaultPrefs()` when `raw.schemaVersion !== CURRENT_SCHEMA_VERSION`.
   Older or newer envelopes are not silently upgraded — we do not guess.
3. For a recognized version, accepts only allow-listed values per field
   (`oneOf` checks against the supported sets) and substitutes defaults for
   anything else.

Rationale: storage on a user's device is untrusted input. We must not crash
the app or leak invalid state into the running tree.

A dev-only `console.warn` fires at most once per session to surface the
fallback path during development. Production builds do not warn.

## Adding a future migration (v1 → v2)

When the schema needs to change:

1. Bump `CURRENT_SCHEMA_VERSION` to `2` and update the `Prefs` type.
2. Add a `migrateV1ToV2(raw: V1): V2` function in `migrations.ts`.
3. In `migratePrefs`, branch on `raw.schemaVersion`:
   - `1` → run `migrateV1ToV2`, then validate the result.
   - `2` → validate directly.
   - else → `defaultPrefs()`.
4. Add unit tests in `migrations.test.ts` for the new branch (happy path
   plus malformed inputs).
5. Update this README and the allow-list. If a new field is being added,
   double-check it is not PII (see allow-list section above).
6. Ship the change in a single commit alongside its tests and docs.

## Files

- `storage.ts` — namespaced `localStorage` adapter with try/catch and SSR
  safety.
- `migrations.ts` — schema version + `migratePrefs` total function.
- `usePreferences.ts` — React hook that reads/writes the three keys via
  the storage adapter; rejects values not on the per-field allow-list.
