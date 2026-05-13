# Planner

Real-time collaborative project management tool — portfolio project targeting a Senior Fullstack / Architect role.

Inspired by Linear. Built with NestJS, React, Nx, PostgreSQL, Redis, and Prisma.

---

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- (For production/Phase 6) AWS CLI + Terraform

---

## Local development setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Then generate an RSA key pair for JWT signing:

```bash
# Generate the private key
openssl genrsa -out apps/api/jwt-private.pem 2048

# Derive the public key
openssl rsa -in apps/api/jwt-private.pem -pubout -out apps/api/jwt-public.pem

# Base64-encode both and paste them into apps/api/.env
base64 -w 0 apps/api/jwt-private.pem   # → JWT_PRIVATE_KEY
base64 -w 0 apps/api/jwt-public.pem    # → JWT_PUBLIC_KEY
```

### 3. Start the local database stack

```bash
docker compose up -d
```

This starts:
- PostgreSQL 16 on port `5432`
- Redis 7 on port `6379`

### 4. Run database migrations

```bash
cd apps/api
npx prisma migrate dev
cd ../..
```

### 5. Start the API

```bash
npx nx serve api
```

NestJS starts on `http://localhost:3000`.

### 6. Start the web app

```bash
npx nx serve web
```

React + Vite starts on `http://localhost:4200`.

---

## Environment variables

`.env` files are **not committed**. Copy the examples and fill in your own values.

### `apps/api/.env` (development)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_PRIVATE_KEY` | Base64-encoded RSA private key (PEM). Used to sign tokens. |
| `JWT_PUBLIC_KEY` | Base64-encoded RSA public key (PEM). Used to verify tokens. |
| `JWT_ACCESS_EXPIRY` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL (e.g. `7d`) |
| `PORT` | API port (default `3000`) |

See `apps/api/.env.example` for the template and key-generation commands.

### `apps/api/.env.test` (integration tests)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Test Postgres on port `5433` |
| `REDIS_URL` | Test Redis on port `6380` |
| `JWT_ACCESS_SECRET` | Any random string — used only for tests |
| `JWT_REFRESH_SECRET` | Any random string — used only for tests |
| `PORT` | Test API port (default `3001`) |

```bash
cp apps/api/.env.test.example apps/api/.env.test
```

> **Do not use dev/test secrets in production.** Phase 6 stores secrets in AWS Secrets Manager.

---

## Running tests

### Unit tests

```bash
npx nx test api
```

### E2E tests — web

```bash
npx nx e2e web-e2e
```

### E2E tests — API (requires running infrastructure)

```bash
# 1. Start test infrastructure
docker compose -f docker-compose.test.yml up -d

# 2. Set up test env (first time only)
cp apps/api/.env.test.example apps/api/.env.test

# 3. Run e2e tests
npx nx e2e api-e2e

# 4. Stop test infrastructure
docker compose -f docker-compose.test.yml down
```

### All affected tests

```bash
npx nx affected -t test
```

---

## Useful Nx commands

```bash
# Lint, typecheck, build only what changed vs main
npx nx affected -t lint typecheck build

# Visualise the project graph
npx nx graph

# Generate a new NestJS module
npx nx g @nx/nest:module modules/identity --project=api

# Keep TypeScript project references in sync
npx nx sync
```

---

## Project structure

```
planner/
├── apps/
│   ├── api/          # NestJS backend (DDD, CQRS, Prisma)
│   └── web/          # React frontend (TanStack Router + Query)
├── libs/
│   └── shared-types/ # DTOs shared between API and Web
├── infra/
│   └── terraform/    # AWS infrastructure (Phase 6)
├── docker-compose.yml       # Local dev: Postgres + Redis
└── docker-compose.test.yml  # Integration test DB
```

See [`planner-implementation-plan.MD`](./planner-implementation-plan.MD) for the full architecture, domain models, API design, and phase-by-phase execution plan.

---

## Implementation phases

| Phase | Scope | Status |
|---|---|---|
| 1 — Foundation | Monorepo, local dev, CI | ✅ Done |
| 2 — Identity & Access | Auth, workspaces, RBAC | 🔲 Next |
| 3 — Project Management | Issues, Kanban board | 🔲 Planned |
| 4 — Real-Time | WebSocket, presence | 🔲 Planned |
| 5 — Collaboration | Comments, activity, notifications | 🔲 Planned |
| 6 — Infrastructure | AWS, Terraform | 🔲 Planned |
