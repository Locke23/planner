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

### 2. Start the local database stack

```bash
docker compose up -d
```

This starts:
- PostgreSQL 16 on port `5432`
- Redis 7 on port `6379`

### 3. Run database migrations

```bash
cd apps/api
npx prisma migrate dev
cd ../..
```

### 4. Start the API

```bash
npx nx serve api
```

NestJS starts on `http://localhost:3000`.

### 5. Start the web app

```bash
npx nx serve web
```

React + Vite starts on `http://localhost:4200`.

---

## Environment variables

The API reads from `apps/api/.env`. The defaults work with the Docker Compose stack out of the box:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://planner:planner@localhost:5432/planner` | Postgres connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `JWT_ACCESS_SECRET` | `dev-access-secret-change-in-prod` | Sign access tokens (RS256 in prod) |
| `JWT_REFRESH_SECRET` | `dev-refresh-secret-change-in-prod` | Sign refresh tokens |
| `PORT` | `3000` | API port |

> **Do not use the dev secrets in production.** Phase 6 stores secrets in AWS Secrets Manager.

---

## Running tests

### Unit + integration tests (all projects affected by changes)

```bash
npx nx affected -t test
```

### Integration tests (requires test DB)

```bash
docker compose -f docker-compose.test.yml up -d
npx nx test api
docker compose -f docker-compose.test.yml down
```

The test DB runs on port `5433` and is configured in `apps/api/.env.test`.

### E2E tests

```bash
npx nx e2e api-e2e
npx nx e2e web-e2e
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
