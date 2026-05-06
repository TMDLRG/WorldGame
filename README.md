# XSWU

A static, kid-safe educational SPA (Vite + React + TypeScript) deployed to Vercel.

**Repository:** [github.com/TMDLRG/WorldGame](https://github.com/TMDLRG/WorldGame)

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
3. `npm run typecheck`
4. `npm test` (vitest)
5. `npm run build`

`main` is protected. Required status checks before merge:

- `CI / lint / typecheck / build / unit`
- 1 reviewer approval

CI runtime budget: under 4 minutes for a clean repo (typical: ~2 minutes).

## Trust posture (NFR-SEC-01)

- Strict CSP, HSTS preload, immutable hashed assets configured in [app/vercel.json](app/vercel.json).
- Zero third-party runtime hosts; zero PII collection.
- See `.cursor/rules/orc-mcp-agent-alignment.mdc` for ORC MCP delivery rules.
