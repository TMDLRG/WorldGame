# XSWU

A static, kid-safe educational SPA (Vite + React + TypeScript) deployed to Vercel.

**Repository:** [github.com/TMDLRG/WorldGame](https://github.com/TMDLRG/WorldGame)

## Deployment (Vercel)

- **Linked CLI project:** team **michael-polzins-projects**, project **`worldgame`** (from `app/`: `npx vercel link --yes --project worldgame`). Inspect deployments in the [worldgame project](https://vercel.com/michael-polzins-projects/worldgame).
- **Import** this repo in the [Vercel dashboard](https://vercel.com) if you prefer dashboard-first setup, and set **Root Directory** to `app` (the Vite app and [app/vercel.json](app/vercel.json) live there). For Git-triggered builds, connect **GitHub → TMDLRG/WorldGame** on that project (CLI `vercel git connect` may fail until the Vercel GitHub integration has access to the org/repo).
- **Production build**: `npm run build` → static output in `app/dist`; SPA rewrites and security headers are defined in `app/vercel.json`.
- **CLI**: from `app/`, `npx vercel --prod` deploys using the linked team/project. After GitHub is connected, pushes to `main` should trigger Preview / Production per your project settings.
- If unauthenticated requests return **401**, turn off **Deployment Protection** for this project (Vercel → Project → Settings → Deployment Protection), or open the URL while signed into the same Vercel team.

## Layout

```
.
+-- app/                    # Vite app (run npm scripts here)
+-- .github/workflows/ci.yml
+-- vercel.json             # in app/, governs CSP + caching
+-- .cursor/                # ORC MCP rules
```

## Local development

Requires Node 20+ (see [app/.nvmrc](app/.nvmrc)).

```bash
cd app
npm ci
npm run dev      # http://localhost:5173
npm test         # vitest
npm run lint
npm run typecheck
npm run build    # emits app/dist with hashed assets
```

## CI / branch protection

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every push and pull request to `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run i18n:parity`
4. `npm run typecheck`
5. `npm test` (vitest)
6. `npm run build`

`main` is protected. Required status checks before merge:

- `CI / lint / i18n:parity / typecheck / build / unit`
- 1 reviewer approval

CI runtime budget: under 4 minutes for a clean repo (typical: ~2 minutes).

## Trust posture (NFR-SEC-01)

- Strict CSP, HSTS preload, immutable hashed assets configured in [app/vercel.json](app/vercel.json).
- Zero third-party runtime hosts; zero PII collection.
- See `.cursor/rules/orc-mcp-agent-alignment.mdc` for ORC MCP delivery rules.
