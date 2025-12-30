# Pastebin-Lite

Small Pastebin-like app built with Next.js and Prisma (SQLite by default).

Features
- Create text pastes with optional TTL and view-count limits
- Shareable URL: `/p/:id`
- API: `POST /api/pastes`, `GET /api/pastes/:id`, `GET /api/healthz`
- Deterministic testing support via `TEST_MODE=1` and `x-test-now-ms` header

Persistence
- Uses SQLite via Prisma by default (`DATABASE_URL="file:./dev.db"`). This is simple for local development. For production/deployment, you should configure `DATABASE_URL` to point to a managed Postgres/SQLite/other supported provider.

Run locally

1. Install dependencies

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

2. Open http://localhost:3000

Notes
- Healthcheck: `GET /api/healthz` returns JSON and indicates DB reachability.
- When `TEST_MODE=1`, include header `x-test-now-ms` to set current time (ms since epoch) for expiry logic.
- Ensure you set `DATABASE_URL` in environment for deployment. Do not commit secrets.

Design decisions
- Prisma is used for a small, typed schema and easier migrations.
- SQLite default allows quick local testing; deploy to a platform with a persistent DB for production.
