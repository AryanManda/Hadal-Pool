Asset Location & Security Checklist

Overview
- Purpose: Track where assets live, how they are secured, and required actions.
- Scope: This repo’s frontend (Vite/React), backend (Express), in-memory storage, and build/output.

Key Metadata
- Repo: PrivacyMixer
- Runtime ports: 5000 (Express app + Vite dev integration)
- Node version: >= 18 (tested on v22)
- Env needed at runtime: DATABASE_URL (dummy acceptable for in-memory), NODE_ENV

Asset Inventory
1) Source code
   - client/: React app source
   - server/: Express server, routes, vite integration
   - shared/: Drizzle schema (types only for current in-memory implementation)
   - configs: vite.config.ts, tailwind.config.ts, postcss.config.js, drizzle.config.ts, tsconfig.json
   - package.json: scripts, deps

2) Build artifacts
   - dist/public/: Vite build output (frontend) when built
   - dist/index.js: Bundled server entry when built

3) Static assets
   - client/index.css, UI components under client/src/components/ui/*
   - attached_assets/: docs and this checklist

4) Data storage
   - server/storage.ts: MemStorage (in-memory, non-persistent)
   - No persistent DB currently wired; drizzle config present for future Postgres

Secrets & Configuration
- Environment variables
  - DATABASE_URL: Required by drizzle tooling; dummy acceptable for current runtime
  - NODE_ENV: development/production
  - PORT: optional (default 5000)
- Location
  - Not committed. Set via shell or process manager.
- Handling Guidance
  - Do not commit .env files with secrets.
  - Use Windows PowerShell: $env:NAME="value"; Use cross-env for portable scripts if needed.

Network & Interfaces
- HTTP server
  - Host: localhost (Windows compatibility)
  - Port: 5000
  - Endpoints:
    - GET /api/pool-stats
    - GET /api/deposits/:address
    - POST /api/deposits
    - POST /api/withdrawals

AuthN/AuthZ
- None implemented (no sessions/headers enforced for API). Risk: open endpoints.

Data Protection
- In-memory only. Loss on restart.
- No PII persistence; userAddress handled as text.

Dependency & Supply Chain
- Framework: React 18, Vite 5, Express 4
- Security-sensitive packages: express-session (present, not used), ws
- Action: Keep dependencies updated; run `npm audit` regularly.

Build & Deployment
- Development: `npm run dev` (Windows requires env var set separately)
- Production: `npm run build` then `npm start`
- Windows Fixes Applied:
  - server/index.ts uses `server.listen(port, "localhost", ...)` (removed reusePort)

Logging & Monitoring
- server/index.ts logs API requests (status, duration, truncated body)
- Action: Consider redaction of sensitive fields if added later.

Risks & Mitigations
- Open APIs without auth: Add auth or rate limiting
- No HTTPS termination: Place behind reverse proxy in production
- In-memory storage: Swap to Postgres via drizzle when persistence needed
- Host binding issues on Windows: Keep localhost binding

Operational Checklist
- [ ] Secrets managed via environment, not committed
- [ ] Dependencies audited: `npm audit` clean or reviewed
- [ ] Port conflicts checked (5000)
- [ ] Lint/typecheck passes: `npm run check`
- [ ] Build succeeds: `npm run build`
- [ ] Endpoint smoke tests pass

Open Actions
- [ ] Add auth middleware for write endpoints
- [ ] Implement Postgres storage and migrations
- [ ] Configure CORS policy if exposing beyond localhost
- [ ] Add .env.example with non-secret placeholders

Maintenance Notes
- Update Browserslist DB: `npx update-browserslist-db@latest`
- Re-verify Windows PowerShell env var commands after shell changes


