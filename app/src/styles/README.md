# `src/styles` — design tokens, layout, and motion policy

This folder owns the visual primitives that every screen consumes. Two files:

- `tokens.ts` — typed JS/TS exports for breakpoints, container widths, paddings, tap target, and minimum body font.
- `layout.css` — the matching CSS variables and utility classes (`.xswu-container`, `.xswu-board`, `.xswu-tappable`, `.xswu-stack`, `.xswu-skip-link`).

Both files are the **single source of truth** for spacing, sizing, and breakpoints. Components MUST consume them via class names or imported tokens; raw pixel values inside components are a smell.

---

## Breakpoints

| key  | min-width | typical device       |
| ---- | --------- | -------------------- |
| `sm` | `375px`   | iPhone SE / iPhone 8 |
| `md` | `768px`   | iPad portrait        |
| `lg` | `1280px`  | laptop, desktop      |

Use `mediaQueryAtLeast('md')` from `tokens.ts` if you need to compose a media query in JS (e.g., for `matchMedia`).

In CSS, prefer the literal `@media (min-width: 768px) { ... }` form so it stays grep-able. Both forms produce the same query.

---

## Container widths

`.xswu-container` is the page-level wrapper:

- `sm`: full width, `padding-inline: 16px`
- `md`: `max-width: 720px`, `padding-inline: 24px`
- `lg`: `max-width: 960px`, `padding-inline: 32px`

The container is mobile-first; max-widths only kick in at the matching breakpoint via min-width media queries.

---

## Game board grid

`.xswu-board` is a CSS Grid with `auto-fit` columns sized by `minmax(min(100%, 96px), 1fr)`. This guarantees:

- Cards never shrink below the screen width on phones (the inner `min(100%, 96px)` clamps to 100% on very small viewports).
- Cards expand to fill the row at larger sizes.
- No horizontal scroll at any breakpoint.

The `gap` scales with `clamp(8px, 1vw + 4px, 16px)`.

---

## Typography

- `html { font-size: 16px }` — pinned at `MIN_BODY_FONT_PX` so iOS Safari does not auto-zoom on input focus.
- `body` font-size scales with `clamp(16px, 1rem + 0.25vw, 18px)`.
- `h1` and `h2` scale with `clamp()` for fluid headings.

Never set a body font below `16px` — tap targets and screen readers depend on the floor.

---

## Tap targets

`.xswu-tappable` enforces `min-width: 44px` and `min-height: 44px` (matches `MIN_TAP_TARGET_PX`). Apply it to every interactive element that does not already meet the size from its content (icon buttons, small chips). Story AC for OAS-428 requires `>= 44px` at every breakpoint.

---

## Visually hidden announcers

`.xswu-visually-hidden` removes content from sighted users while keeping it in the accessibility tree (it uses `clip: rect(0 0 0 0)` plus 1 px size and negative margin — the established "sr-only" pattern). The `<A11yAnnouncer />` component in `src/components/A11yAnnouncer.tsx` mounts a `role="status"` `aria-live="polite"` `aria-atomic="true"` div with this class. Pair it with the `useAnnouncer()` hook in `src/state/useAnnouncer.ts`: call `announce("Nice match")` on a correct tap and SR will speak the message; calling the same text twice still re-announces because the hook flips a trailing zero-width space.

---

## Focus + keyboard navigation

The global `:focus-visible` rule in `layout.css` paints a 3 px outline with a 2 px offset. Three CSS variables drive it:

- `--xswu-focus-ring-width` (default `3px`)
- `--xswu-focus-ring-offset` (default `2px`)
- `--xswu-focus-ring-color` (default `#0a3a8c`; switches to system `Highlight` under `(forced-colors: active)`)

Mouse users do not see the ring because we use `:focus-visible`, not `:focus`. **Never write `outline: none` against a focusable element** — it removes the ring everywhere and breaks the keyboard contract.

Every screen renders a `<SkipLink />` (in `src/components/SkipLink.tsx`) as the first focusable element. The link points to `#main-content` and the screen's `<main>` element carries `id="main-content"` plus `tabIndex={-1}` so the browser can move focus to it programmatically.

---

## Motion policy

Reduced-motion handling lives in two places:

1. **Global CSS reset** in `layout.css`: a `@media (prefers-reduced-motion: reduce)` block disables `animation` and `transition` on every element (`*, *::before, *::after`) and pins durations to `0.001ms` so tests can still observe state changes deterministically.
2. **React hook** `useReducedMotion()` in `src/state/useReducedMotion.ts`: returns a boolean that mirrors the OS-level setting and updates live on `MediaQueryList` change events. Components that animate should branch on this hook to skip motion paths entirely (for example, the Shape Memory mismatch flip-back is instant when reduced motion is enabled).

Browsers that do not implement `matchMedia` or `(prefers-reduced-motion)` get the safe default (`false` / motion enabled). Server-side renders return `false` and rehydrate without flicker because the initial state is read synchronously from `matchMedia` on the first render.

**Do not write new animations in components without consulting `useReducedMotion()`.** The global CSS gate is a defense in depth, but per-component branches give us full control over the motion-off path (for example, replacing a celebratory animation with a static badge).

---

## How to add a new token

1. Add the constant to `tokens.ts` with a literal type (`as const`).
2. Mirror it as a CSS variable in `:root` inside `layout.css`.
3. Reference the variable from utility classes; never hardcode the value in component CSS.
4. Add a row to the relevant table above.

Tokens are versioned with the rest of the source. Breaking changes (renaming a key, changing a numeric value) require a CHANGELOG entry and a PR review.
