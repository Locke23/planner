# Planner — Implementation Plan

> Real-Time Collaborative Project Management Tool  
> Portfolio project targeting a Senior Fullstack / Architect role  
> Author: Lucas (@Locke23) · Last updated: 2026-05-12

---

## Table of Contents

1. [Project Goal](#1-project-goal)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Nx Monorepo Structure](#4-nx-monorepo-structure)
5. [Bounded Contexts](#5-bounded-contexts)
6. [Domain Models](#6-domain-models)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [WebSocket Event Catalog](#9-websocket-event-catalog)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [DDD Layer Architecture](#11-ddd-layer-architecture)
12. [TDD Strategy](#12-tdd-strategy)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [AWS Architecture (Phase 6)](#14-aws-architecture-phase-6)
15. [Phase-by-Phase Execution Plan](#15-phase-by-phase-execution-plan)

---

## 1. Project Goal

**Planner** is a multi-tenant, real-time collaborative project management tool inspired by Linear. Users can create workspaces, invite members, manage projects, track issues on a Kanban board, and collaborate via comments — all with live updates across connected clients.

### What this project demonstrates for an Architect role

| Skill | Where it shows |
|---|---|
| Domain-Driven Design | Bounded contexts, aggregates, domain events, ubiquitous language |
| Test-Driven Development | Domain layer tested in isolation, application layer with mocks, e2e with real DB |
| Distributed systems thinking | Redis pub/sub for horizontal WebSocket scaling |
| Monorepo discipline | Nx with enforced module boundaries between bounded contexts |
| Infrastructure as Code | Terraform modules targeting AWS |
| Security | JWT rotation, RBAC, row-level data isolation per workspace |
| Frontend architecture | TanStack Query for server state, TanStack Router for type-safe routing |
| Full-stack ownership | End-to-end feature delivery from DB schema to UI |

---

## 2. Tech Stack & Rationale

### Backend — NestJS (TypeScript)

**Why NestJS over plain Express:**
- NestJS modules map 1:1 to DDD bounded contexts. Each module has its own providers, controllers, and exports — enforcing encapsulation structurally.
- Dependency injection is built-in, which is essential for TDD (you swap real implementations for mocks without effort).
- Decorators (`@Aggregate`, `@Command`, `@Query`) make DDD intent explicit in code.
- First-class support for WebSockets via `@WebSocketGateway`.

**Why TypeScript over Go:**
- Shared types between frontend and backend via Nx `libs/` — a single `IssueDto` type is used in both the API response and the React component. Go cannot share types with a TypeScript frontend.
- NestJS ecosystem has more DDD/CQRS tooling (`@nestjs/cqrs`).

**Trade-off to be aware of:** Go would give better raw performance and smaller Docker images. For a real high-scale system, Go microservices handling hot paths (real-time, search) would be justified. Here, NestJS is the right trade-off for expressiveness and portfolio breadth.

### Frontend — React + TanStack Query + TanStack Router

**Why TanStack Query:**
- Separates server state (data from API) from client state (UI state). This is the correct mental model — most "state management" problems are actually cache invalidation problems.
- Built-in cache invalidation, background refetching, and optimistic updates — essential for a collaborative tool where data changes from WebSocket events.
- Alternative (Redux + RTK Query) adds more boilerplate for the same result.

**Why TanStack Router:**
- Fully type-safe routes. Route params and search params are typed end-to-end — no `useParams()` returning `string | undefined`.
- File-based routing with type inference.
- Alternative (React Router v6) lacks end-to-end type safety.

### Monorepo — Nx

**Why Nx over Turborepo:**
- Nx has first-class NestJS generators (`nx g @nx/nest:app`).
- Module boundary enforcement via `@nx/eslint-plugin` — you can configure rules that prevent `projects` module from directly importing `collaboration` module, enforcing bounded context isolation at the linter level.
- `nx affected` only runs tests/builds for code that actually changed, which keeps CI fast as the repo grows.

**Trade-off:** Nx adds configuration overhead. `project.json`, `nx.json`, executor config. If something breaks in the Nx build pipeline, debugging it requires understanding Nx internals. Worth it for a monorepo of this shape.

### Database — PostgreSQL

**Why PostgreSQL over alternatives:**
- Row-Level Security (RLS) is native to Postgres — workspace isolation can be enforced at the DB layer, not just application layer.
- `LISTEN/NOTIFY` for lightweight event streaming between services if needed later.
- JSONB columns for flexible `activity` log entries (issue changes are semi-structured).
- Full-text search with `tsvector` for issue search without adding Elasticsearch.

### Cache & Pub/Sub — Redis

**Two distinct roles:**
1. **Session store** — JWT refresh tokens are stored in Redis with TTL. Revoking a token is an O(1) delete, not a DB query.
2. **Socket.io adapter** — When multiple ECS tasks are running (horizontal scaling), Socket.io needs a shared pub/sub bus. The Redis adapter broadcasts events across all instances. Without this, a user connected to instance A would not receive events emitted on instance B.

### ORM — Prisma

**Why Prisma over TypeORM:**
- Schema-first (`schema.prisma`) generates both migrations and the TypeScript client. Single source of truth.
- TypeORM's decorator-based model definitions bleed infrastructure concerns into domain entities (your `User` entity would have `@Column`, `@Entity` decorators — these are ORM concerns, not domain concerns).
- Prisma keeps the domain entity clean: a plain TypeScript class with no ORM decorators. The Prisma client lives only in the infrastructure layer.

**Trade-off:** Prisma's generated client is not easily mockable. In tests, we use a test database (Docker Compose) rather than mocking Prisma. This is actually better — it tests real SQL behavior.

### IaC — Terraform targeting AWS

Covered in detail in [Section 14](#14-aws-architecture-phase-6).

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│                                                                   │
│  React App (S3 + CloudFront)                                      │
│  ├── TanStack Router (type-safe file-based routing)              │
│  ├── TanStack Query (server state + cache invalidation)          │
│  └── Socket.io Client (real-time event subscription)            │
└───────────────────────────┬────────────────────────┬────────────┘
                            │ HTTPS REST             │ WSS
                            ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NestJS API (ECS Fargate)                        │
│                                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Identity   │ │   Projects   │ │Collaboration │            │
│  │   Module     │ │   Module     │ │   Module     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────────────────────┐             │
│  │Notifications │ │     Real-time Module          │             │
│  │   Module     │ │  (Socket.io Gateway)          │             │
│  └──────────────┘ └──────────────────────────────┘             │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
          ┌─────────▼───────┐   ┌─────────▼───────┐
          │  RDS PostgreSQL  │   │ ElastiCache Redis│
          │  (primary store) │   │ (sessions+pubsub)│
          └─────────────────┘   └─────────────────┘
```

### Request lifecycle (example: update issue status)

```
1. User drags issue card on board
2. React calls PATCH /projects/:projectId/issues/:issueId
3. TanStack Query sends optimistic update (UI reflects change immediately)
4. NestJS controller validates JWT, extracts workspace context
5. Application layer dispatches UpdateIssueStatusCommand
6. Domain layer validates the transition (e.g., DONE → BACKLOG is allowed)
7. Infrastructure layer persists via Prisma
8. Domain event IssueStatusUpdated is published
9. Real-time module picks up event, emits to Socket.io room
10. All connected clients in that project receive the update
11. TanStack Query invalidates the issues cache on receiving the WS event
```

---

## 4. Nx Monorepo Structure

```
planner/
├── apps/
│   ├── api/                              # NestJS application
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── identity/
│   │       │   │   ├── domain/
│   │       │   │   │   ├── entities/     # User, Workspace, Member
│   │       │   │   │   ├── value-objects/# Email, Role, WorkspaceSlug
│   │       │   │   │   ├── events/       # UserRegistered, MemberInvited
│   │       │   │   │   ├── exceptions/   # DomainException subclasses
│   │       │   │   │   └── repositories/ # IUserRepository (interfaces only)
│   │       │   │   ├── application/
│   │       │   │   │   ├── commands/     # RegisterUser, CreateWorkspace, InviteMember
│   │       │   │   │   ├── queries/      # GetWorkspaceMembers, GetCurrentUser
│   │       │   │   │   └── handlers/     # CommandHandlers, QueryHandlers
│   │       │   │   ├── infra/
│   │       │   │   │   ├── persistence/  # PrismaUserRepository (implements IUserRepository)
│   │       │   │   │   └── auth/         # JwtStrategy, RefreshTokenStrategy
│   │       │   │   ├── presentation/
│   │       │   │   │   ├── controllers/  # AuthController, WorkspaceController
│   │       │   │   │   └── dtos/         # Request/response DTOs with class-validator
│   │       │   │   └── identity.module.ts
│   │       │   ├── projects/             # Same structure
│   │       │   ├── collaboration/        # Same structure
│   │       │   ├── notifications/        # Same structure
│   │       │   └── realtime/
│   │       │       ├── gateways/         # IssueGateway, PresenceGateway
│   │       │       └── realtime.module.ts
│   │       ├── shared/
│   │       │   ├── domain/
│   │       │   │   ├── base-entity.ts    # id, createdAt, updatedAt
│   │       │   │   ├── base-aggregate.ts # domainEvents collection
│   │       │   │   └── domain-event.ts   # IDomainEvent interface
│   │       │   └── infra/
│   │       │       ├── prisma.service.ts
│   │       │       └── event-bus.service.ts
│   │       └── main.ts
│   └── web/                              # React application
│       └── src/
│           ├── routes/                   # TanStack Router file-based routes
│           │   ├── __root.tsx            # Root layout (auth check)
│           │   ├── index.tsx             # Landing / redirect
│           │   ├── login.tsx
│           │   ├── register.tsx
│           │   └── $workspaceSlug/
│           │       ├── index.tsx         # Workspace dashboard
│           │       ├── settings.tsx
│           │       └── $projectId/
│           │           ├── board.tsx     # Kanban board
│           │           ├── list.tsx      # List view
│           │           └── issues/
│           │               └── $issueId.tsx  # Issue detail
│           ├── features/
│           │   ├── auth/                 # Login form, register form, hooks
│           │   ├── workspace/            # Workspace switcher, settings
│           │   ├── projects/             # Project list, create modal
│           │   ├── issues/               # Issue card, issue detail, drag-and-drop board
│           │   ├── comments/             # Comment thread, editor
│           │   └── notifications/        # Notification bell, feed
│           ├── shared/
│           │   ├── components/           # Button, Input, Modal, Avatar, Badge
│           │   ├── hooks/                # useSocket, useWorkspace
│           │   └── lib/                  # axios instance, queryClient
│           └── main.tsx
├── libs/
│   └── shared-types/                     # Shared DTOs between API and Web
│       └── src/
│           ├── auth.ts                   # LoginDto, TokenResponse
│           ├── workspace.ts              # WorkspaceDto, MemberDto
│           ├── project.ts                # ProjectDto, StatusDto
│           ├── issue.ts                  # IssueDto, CreateIssueDto
│           └── index.ts
├── infra/
│   ├── docker/
│   │   └── api.Dockerfile
│   └── terraform/                        # Phase 6
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint, test, build on PR
│       └── deploy.yml                    # Push to ECR + deploy on main merge
├── docker-compose.yml                    # Local dev: Postgres + Redis
├── docker-compose.test.yml               # Integration test DB
├── nx.json
├── package.json
└── tsconfig.base.json
```

### Why `libs/shared-types`?

Without it, the frontend either duplicates type definitions (drift risk) or calls the API and infers types manually (unsafe). With `libs/shared-types`, a `CreateIssueDto` defined once is imported by both the NestJS controller validation pipe and the React mutation hook. Type errors surface at compile time, not at runtime.

---

## 5. Bounded Contexts

A bounded context is a boundary within which a specific domain model applies. The same word can mean different things in different contexts — in Identity, a "User" owns credentials and profile. In Projects, the same person is an "Assignee" (just an ID reference). This distinction prevents one bloated `User` model from serving all purposes.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Identity & Access Context                      │
│                                                                   │
│  Owns: User, Workspace, Member, Invitation, Role                  │
│  Responsibilities: registration, login, token management,         │
│                    workspace membership, RBAC enforcement         │
│  Publishes: UserRegistered, MemberJoined, MemberRemoved           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Project Management Context                      │
│                                                                   │
│  Owns: Project, Issue, Status, Label, Priority                    │
│  Responsibilities: issue lifecycle, workflow transitions,         │
│                    project configuration, issue numbering         │
│  Consumes: MemberJoined (to allow assignment)                     │
│  Publishes: IssueCreated, IssueStatusChanged, IssueAssigned       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Collaboration Context                         │
│                                                                   │
│  Owns: Comment, Activity, Reaction                                │
│  Responsibilities: threaded discussion, activity log,            │
│                    @mentions                                      │
│  Consumes: IssueCreated, IssueStatusChanged, IssueAssigned        │
│            (to generate activity entries)                         │
│  Publishes: CommentAdded, MentionCreated                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Notification Context                           │
│                                                                   │
│  Owns: Notification, NotificationPreference                       │
│  Responsibilities: fan-out notifications to affected users,       │
│                    marking read/unread                            │
│  Consumes: MentionCreated, IssueAssigned, CommentAdded            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Real-time Context                            │
│                                                                   │
│  Owns: SocketRoom, PresenceRecord                                 │
│  Responsibilities: broadcasting domain events to connected        │
│                    clients, tracking online presence              │
│  Consumes: all published domain events                            │
└─────────────────────────────────────────────────────────────────┘
```

### Cross-context communication rule

Contexts **never import each other's domain models**. Communication happens through:
1. **Domain events** (in-process via NestJS `EventBus` from `@nestjs/cqrs`) — fire and forget
2. **Application Services** — when context B needs data from context A, it calls context A's public application service interface, never its repository directly

---

## 6. Domain Models

### Identity & Access

```typescript
// Aggregate Root
class User {
  readonly id: UserId           // Value Object wrapping UUID
  readonly email: Email         // Value Object — validates format, lowercases
  private name: string
  private passwordHash: string
  readonly createdAt: Date

  static register(email: string, name: string, rawPassword: string): User
  changePassword(currentHash: string, newRawPassword: string): void
}

// Aggregate Root
class Workspace {
  readonly id: WorkspaceId
  readonly slug: WorkspaceSlug  // Value Object — URL-safe, unique, immutable after creation
  private name: string
  readonly ownerId: UserId
  private members: Member[]

  static create(name: string, owner: User): Workspace
  addMember(userId: UserId, role: Role): Member
  removeMember(userId: UserId): void
  getMember(userId: UserId): Member | null
  transferOwnership(newOwnerId: UserId): void
}

// Entity (within Workspace aggregate)
class Member {
  readonly userId: UserId
  readonly workspaceId: WorkspaceId
  role: Role                    // Value Object: OWNER | ADMIN | MEMBER
  readonly joinedAt: Date
}

// Value Objects
class Role {
  static readonly OWNER: Role
  static readonly ADMIN: Role
  static readonly MEMBER: Role
  canManageMembers(): boolean
  canDeleteProjects(): boolean
}
```

### Project Management

```typescript
// Aggregate Root
class Project {
  readonly id: ProjectId
  readonly workspaceId: WorkspaceId
  private name: string
  readonly identifier: ProjectIdentifier  // e.g. "PLN" — used for issue numbers PLN-1
  private statuses: Status[]

  static create(workspaceId: WorkspaceId, name: string, identifier: string): Project
  addStatus(name: string, color: string, type: StatusType): Status
  reorderStatuses(orderedIds: StatusId[]): void
  getDefaultStatus(): Status
}

// Aggregate Root
class Issue {
  readonly id: IssueId
  readonly projectId: ProjectId
  readonly workspaceId: WorkspaceId
  readonly number: IssueNumber    // Sequential per project: PLN-1, PLN-2...
  private title: string
  private description: string | null
  private statusId: StatusId
  private assigneeId: UserId | null
  private priority: Priority      // Value Object: NO_PRIORITY | URGENT | HIGH | MEDIUM | LOW
  private labelIds: LabelId[]
  readonly createdBy: UserId
  readonly createdAt: Date
  private updatedAt: Date

  static create(props: CreateIssueProps, project: Project): Issue
  changeStatus(newStatusId: StatusId, project: Project): void  // validates statusId belongs to project
  assign(userId: UserId): void
  unassign(): void
  changePriority(priority: Priority): void
  addLabel(labelId: LabelId): void
  removeLabel(labelId: LabelId): void
  updateTitle(title: string): void
  updateDescription(description: string): void
}
```

### Collaboration

```typescript
// Aggregate Root
class Comment {
  readonly id: CommentId
  readonly issueId: IssueId
  readonly authorId: UserId
  private content: string         // Markdown
  private mentionedUserIds: UserId[]
  private reactions: Reaction[]
  readonly createdAt: Date
  private updatedAt: Date
  private deletedAt: Date | null

  static create(issueId: IssueId, authorId: UserId, content: string): Comment
  edit(content: string, editorId: UserId): void   // only author can edit
  softDelete(actorId: UserId): void
  addReaction(userId: UserId, emoji: string): void
  removeReaction(userId: UserId, emoji: string): void
}

// Entity — not an aggregate, created as side effect of domain events
class Activity {
  readonly id: ActivityId
  readonly issueId: IssueId
  readonly actorId: UserId
  readonly type: ActivityType     // STATUS_CHANGED | ASSIGNED | PRIORITY_CHANGED | etc.
  readonly changes: ActivityChanges  // JSONB: { from: any, to: any }
  readonly createdAt: Date
}
```

---

## 7. Database Schema

```sql
-- Identity & Access
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  owner_id    UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE invitations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL,
  role         VARCHAR(20) NOT NULL,
  token        VARCHAR(255) NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL,
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Management
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  identifier   VARCHAR(10) NOT NULL,  -- e.g. 'PLN'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, identifier)
);

CREATE TABLE statuses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        VARCHAR(7) NOT NULL,   -- hex color
  type         VARCHAR(20) NOT NULL CHECK (type IN ('BACKLOG','TODO','IN_PROGRESS','DONE','CANCELLED')),
  position     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (project_id, name)
);

CREATE TABLE labels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        VARCHAR(7) NOT NULL,
  UNIQUE (project_id, name)
);

CREATE TABLE issues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  number       INTEGER NOT NULL,  -- sequential per project
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  status_id    UUID NOT NULL REFERENCES statuses(id),
  assignee_id  UUID REFERENCES users(id),
  priority     VARCHAR(20) NOT NULL DEFAULT 'NO_PRIORITY'
                 CHECK (priority IN ('NO_PRIORITY','URGENT','HIGH','MEDIUM','LOW')),
  created_by   UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, number)
);

CREATE TABLE issue_labels (
  issue_id  UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id  UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

-- Collaboration
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id     UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES users(id),
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE reactions (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji      VARCHAR(10) NOT NULL,
  PRIMARY KEY (comment_id, user_id, emoji)
);

CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id     UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  actor_id     UUID NOT NULL REFERENCES users(id),
  type         VARCHAR(50) NOT NULL,
  changes      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           VARCHAR(50) NOT NULL,
  reference_id   UUID NOT NULL,
  reference_type VARCHAR(50) NOT NULL,  -- 'ISSUE' | 'COMMENT'
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_workspace_id ON issues(workspace_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status_id ON issues(status_id);
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_activities_issue_id ON activities(issue_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;
```

---

## 8. API Design

All endpoints are prefixed `/api/v1`. Authentication via `Authorization: Bearer <access_token>` header.

### Auth

```
POST   /auth/register          Register new user
POST   /auth/login             Login, returns access + refresh tokens
POST   /auth/refresh           Rotate refresh token
POST   /auth/logout            Revoke refresh token
GET    /auth/me                Get current user profile
```

### Workspaces

```
POST   /workspaces                     Create workspace
GET    /workspaces                     List workspaces for current user
GET    /workspaces/:slug               Get workspace by slug
PATCH  /workspaces/:slug               Update name (ADMIN+)
DELETE /workspaces/:slug               Delete workspace (OWNER only)
GET    /workspaces/:slug/members       List members
DELETE /workspaces/:slug/members/:uid  Remove member (ADMIN+)
PATCH  /workspaces/:slug/members/:uid  Change member role (OWNER only)
POST   /workspaces/:slug/invitations   Send invitation email
POST   /invitations/:token/accept      Accept invitation (public)
```

### Projects

```
POST   /workspaces/:slug/projects            Create project
GET    /workspaces/:slug/projects            List projects
GET    /workspaces/:slug/projects/:projectId Get project + statuses + labels
PATCH  /workspaces/:slug/projects/:projectId Update project (ADMIN+)
DELETE /workspaces/:slug/projects/:projectId Delete project (ADMIN+)
POST   /workspaces/:slug/projects/:projectId/statuses         Add status
PATCH  /workspaces/:slug/projects/:projectId/statuses/:id     Update status
DELETE /workspaces/:slug/projects/:projectId/statuses/:id     Delete status
POST   /workspaces/:slug/projects/:projectId/statuses/reorder Reorder statuses
```

### Issues

```
POST   /workspaces/:slug/projects/:projectId/issues           Create issue
GET    /workspaces/:slug/projects/:projectId/issues           List issues (filterable)
GET    /workspaces/:slug/projects/:projectId/issues/:number   Get issue by number (e.g. PLN-1)
PATCH  /workspaces/:slug/projects/:projectId/issues/:number   Update issue
DELETE /workspaces/:slug/projects/:projectId/issues/:number   Delete issue

Query params for list:
  ?status=<id>
  ?assignee=<userId>
  ?priority=HIGH,URGENT
  ?label=<labelId>
  ?q=<search text>
```

### Comments

```
POST   /issues/:issueId/comments       Add comment
GET    /issues/:issueId/comments       List comments + activity (timeline)
PATCH  /comments/:commentId            Edit comment (author only)
DELETE /comments/:commentId            Soft delete (author or ADMIN)
POST   /comments/:commentId/reactions  Add reaction
DELETE /comments/:commentId/reactions/:emoji  Remove reaction
```

### Notifications

```
GET    /notifications        List notifications (paginated)
PATCH  /notifications/read   Mark all as read
PATCH  /notifications/:id/read  Mark one as read
```

---

## 9. WebSocket Event Catalog

Clients connect to `wss://api.planner.app/realtime` with the access token in the handshake query.

### Rooms

| Room pattern | Who joins | Purpose |
|---|---|---|
| `workspace:{workspaceId}` | All workspace members | Member join/leave events |
| `project:{projectId}` | Members with project access | Issue changes |
| `issue:{issueId}` | Clients viewing that issue | Comments, reactions, presence |

### Server → Client events

```typescript
// Issue events (room: project:{projectId})
'issue:created'        { issue: IssueDto }
'issue:updated'        { issueId: string, changes: Partial<IssueDto> }
'issue:deleted'        { issueId: string }
'issue:status_changed' { issueId: string, statusId: string, updatedBy: string }
'issue:assigned'       { issueId: string, assigneeId: string | null }

// Comment events (room: issue:{issueId})
'comment:created'      { comment: CommentDto }
'comment:updated'      { commentId: string, content: string }
'comment:deleted'      { commentId: string }
'reaction:added'       { commentId: string, userId: string, emoji: string }
'reaction:removed'     { commentId: string, userId: string, emoji: string }

// Presence events (room: project:{projectId})
'presence:update'      { userId: string, online: boolean, viewingIssueId: string | null }

// Notification events (room: user:{userId} — private room)
'notification:created' { notification: NotificationDto }
```

### Client → Server events

```typescript
'presence:viewing'     { projectId: string, issueId: string | null }
'presence:leave'       { projectId: string }
```

---

## 10. Authentication & Authorization

### JWT Strategy

```
Access token:  15 minutes TTL, signed RS256, payload: { sub: userId, workspaceIds: [] }
Refresh token: 7 days TTL, stored in Redis as: refresh:{userId}:{tokenId} → tokenId
```

**Why RS256 over HS256:** RS256 uses asymmetric keys. The private key signs tokens (only the API server holds it). The public key verifies tokens (could be shared with other services without exposing the signing key). This is the production-grade choice.

**Why Redis for refresh tokens, not DB:**
- Revocation is O(1): `DEL refresh:{userId}:{tokenId}`
- "Log out everywhere" is: `DEL refresh:{userId}:*`
- TTL is automatic — no cron job needed to clean expired tokens
- DB would require a query on every token refresh

### Refresh token rotation

```
1. Client sends refresh token
2. Server validates token exists in Redis
3. Server DELETES the old token (reuse detection: if already deleted, revoke all user tokens)
4. Server issues new access token + new refresh token
5. New refresh token stored in Redis
```

This prevents token theft: if a stolen refresh token is used after the legitimate client has already rotated it, the server detects the reuse and revokes all sessions.

### RBAC

```
Permission Matrix:

Action                     OWNER  ADMIN  MEMBER
─────────────────────────────────────────────────
Delete workspace             ✓      ✗      ✗
Manage members (add/remove)  ✓      ✓      ✗
Change member role           ✓      ✗      ✗
Create/delete project        ✓      ✓      ✗
Edit project settings        ✓      ✓      ✗
Create/edit/delete issue     ✓      ✓      ✓
Comment                      ✓      ✓      ✓
View project                 ✓      ✓      ✓
```

Implemented as a NestJS `@Guard` + `@RequireRole(Role.ADMIN)` decorator. The guard loads the caller's membership from Redis cache (warm) or DB (cold) and checks the required role.

---

## 11. DDD Layer Architecture

Each bounded context strictly follows this layer structure. Dependencies only point inward.

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer                                   │
│  (Controllers, WebSocket Gateways, DTOs)             │
│  ← depends on Application                            │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│  Application Layer                                    │
│  (Commands, Queries, Handlers, Application Services) │
│  ← depends on Domain interfaces only                 │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│  Domain Layer                                         │
│  (Entities, Aggregates, Value Objects, Events,       │
│   Repository Interfaces, Domain Services)            │
│  ← zero external dependencies                        │
└─────────────────────────────────────────────────────┘
          ▲ implements interfaces from Domain
┌─────────────────────────────────────────────────────┐
│  Infrastructure Layer                                 │
│  (Prisma Repositories, Email, Redis, External APIs)  │
└─────────────────────────────────────────────────────┘
```

### Why this matters for TDD

- **Domain layer** has zero NestJS, zero Prisma, zero Express. Test it with plain Jest — no mocking needed.
- **Application layer** depends on repository _interfaces_. In tests, inject an in-memory implementation — no DB required. Tests run in milliseconds.
- **Infrastructure layer** tests hit a real Postgres (Docker Compose test DB). These are integration tests.
- **Presentation layer** tested with Supertest hitting the full NestJS app (e2e).

### CQRS with @nestjs/cqrs

```typescript
// Command: mutates state
class ChangeIssueStatusCommand {
  constructor(
    public readonly issueId: string,
    public readonly newStatusId: string,
    public readonly actorId: string,
  ) {}
}

// Query: reads state, never mutates
class GetProjectIssuesQuery {
  constructor(
    public readonly projectId: string,
    public readonly filters: IssueFilters,
  ) {}
}
```

Commands go through the domain layer (full validation, domain events). Queries can bypass the domain and hit the DB directly via a read model — this is the "Q" in CQRS and enables optimized read queries without polluting the domain model.

---

## 12. TDD Strategy

### Testing pyramid

```
         /\
        /  \    E2E Tests (few)
       /    \   Supertest + real DB + real Redis
      /──────\
     /        \  Integration Tests (some)
    /          \  Repository tests hitting test DB
   /────────────\
  /              \ Unit Tests (many)
 /                \ Domain + Application with in-memory repos
/──────────────────\
```

### Unit tests — Domain layer

```typescript
// Example: issues.spec.ts
describe('Issue', () => {
  it('should create an issue with default NO_PRIORITY', () => {
    const issue = Issue.create({ title: 'Fix login bug', projectId, workspaceId }, project)
    expect(issue.priority).toBe(Priority.NO_PRIORITY)
  })

  it('should raise IssueStatusChanged event when status changes', () => {
    const issue = Issue.create(props, project)
    issue.changeStatus(newStatusId, project)
    expect(issue.domainEvents).toContainEqual(
      expect.objectContaining({ type: 'IssueStatusChanged' })
    )
  })

  it('should throw if statusId does not belong to project', () => {
    expect(() => issue.changeStatus(foreignStatusId, project))
      .toThrow(InvalidStatusException)
  })
})
```

### Unit tests — Application layer

```typescript
// CommandHandler test with in-memory repository
describe('ChangeIssueStatusHandler', () => {
  let handler: ChangeIssueStatusHandler
  let issueRepo: InMemoryIssueRepository  // implements IIssueRepository

  beforeEach(() => {
    issueRepo = new InMemoryIssueRepository()
    handler = new ChangeIssueStatusHandler(issueRepo, eventBusMock)
  })

  it('should persist updated status and publish domain event', async () => {
    const issue = issueRepo.seed(IssueFactory.create())
    await handler.execute(new ChangeIssueStatusCommand(issue.id, newStatusId, actorId))
    expect(issueRepo.findById(issue.id).statusId).toBe(newStatusId)
    expect(eventBusMock.published).toContainEqual(expect.objectContaining({ type: 'IssueStatusChanged' }))
  })
})
```

### Integration tests — Infrastructure layer

```typescript
// Repository test against real Postgres (test Docker container)
describe('PrismaIssueRepository', () => {
  it('should persist and retrieve an issue', async () => {
    const issue = IssueFactory.create({ projectId: seededProject.id })
    await repo.save(issue)
    const found = await repo.findById(issue.id)
    expect(found.title).toBe(issue.title)
  })
})
```

### E2E tests

```typescript
// Full HTTP round-trip
describe('PATCH /projects/:projectId/issues/:number', () => {
  it('should change issue status and broadcast WS event', async () => {
    const wsClient = connectSocketClient(accessToken)
    await wsClient.joinRoom(`project:${project.id}`)

    await request(app.getHttpServer())
      .patch(`/api/v1/workspaces/${slug}/projects/${project.id}/issues/PLN-1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ statusId: newStatus.id })
      .expect(200)

    const event = await wsClient.waitForEvent('issue:status_changed')
    expect(event.issueId).toBe(issue.id)
  })
})
```

---

## 13. CI/CD Pipeline

### On Pull Request (`ci.yml`)

```yaml
jobs:
  affected:
    # Determine which apps/libs changed
    run: nx affected --target=lint,test,build --base=origin/main

  test-api:
    services:
      postgres: postgres:16
      redis: redis:7
    run: nx test api --coverage

  test-web:
    run: nx test web --coverage

  type-check:
    run: nx run-many --target=typecheck --all
```

### On merge to `main` (`deploy.yml`)

```yaml
jobs:
  build-and-push:
    # Build Docker image
    # Push to ECR
    # Tag with Git SHA

  deploy-api:
    # Update ECS task definition with new image tag
    # Trigger ECS rolling deployment
    # Wait for deployment to stabilize

  deploy-web:
    # nx build web (static assets)
    # Sync to S3 bucket
    # Invalidate CloudFront cache
```

### Why rolling deployment (not blue/green)?

For a portfolio project, rolling deployment is sufficient and simpler. Blue/green requires double the infrastructure during deployment (two full task sets). Rolling replaces tasks one at a time — brief period where old and new versions coexist. This means the API must be **backwards-compatible** during deployment (no breaking DB migrations mid-deploy). We enforce this with the migration strategy: always add columns as nullable first, then backfill, then add NOT NULL constraint in a later deploy.

---

## 14. AWS Architecture (Phase 6)

### Infrastructure diagram

```
                         Route 53
                             │
              ┌──────────────┴──────────────┐
              │                             │
        CloudFront                         ALB
              │                             │
           S3 Bucket               ┌────────┴────────┐
        (React static)         ECS Task          ECS Task
                                   │                  │
                     ┌─────────────┴──────────────────┘
                     │                    │
               RDS PostgreSQL      ElastiCache Redis
               (Multi-AZ prod)     (cluster mode off)
```

### VPC layout

```
VPC: 10.0.0.0/16

Public subnets (ALB, NAT Gateway):
  10.0.1.0/24  us-east-1a
  10.0.2.0/24  us-east-1b

Private subnets (ECS, RDS, Redis):
  10.0.3.0/24  us-east-1a
  10.0.4.0/24  us-east-1b
```

ECS tasks run in private subnets — they cannot be reached from the internet directly. Only the ALB (in public subnets) routes traffic to them. RDS and Redis are also in private subnets and accept connections only from ECS security group.

### Terraform module structure

```
infra/terraform/
├── modules/
│   ├── networking/       # VPC, subnets, IGW, NAT, security groups, route tables
│   ├── ecr/              # Container registry per app
│   ├── ecs/              # Cluster, task definition, service, IAM task role
│   ├── rds/              # RDS instance, subnet group, parameter group
│   ├── elasticache/      # Redis replication group, subnet group
│   └── frontend/         # S3 bucket (private), CloudFront OAC distribution
└── environments/
    ├── dev/
    │   ├── main.tf       # Calls modules with dev vars (t3.micro, single AZ)
    │   ├── variables.tf
    │   └── terraform.tfvars
    └── prod/
        ├── main.tf       # Multi-AZ RDS, autoscaling ECS
        ├── variables.tf
        └── terraform.tfvars
```

---

## 15. Phase-by-Phase Execution Plan

### Phase 1 — Foundation

**Goal:** Working monorepo with local dev environment running.

- [ ] Create GitHub repo `planner` at github.com/Locke23/planner
- [ ] Initialize Nx monorepo (`create-nx-workspace`)
- [ ] Add NestJS app (`nx g @nx/nest:app api`)
- [ ] Add React app (`nx g @nx/react:app web`)
- [ ] Add shared types lib (`nx g @nx/js:lib shared-types`)
- [ ] Configure Nx module boundary lint rules
- [ ] Write `docker-compose.yml` (Postgres 16 + Redis 7)
- [ ] Configure Prisma with initial schema + migrations
- [ ] Configure base NestJS structure (shared module, Prisma service, event bus)
- [ ] Configure TanStack Router + TanStack Query in React app
- [ ] Configure GitHub Actions CI (lint + type-check on PR)
- [ ] Write README with setup instructions

**Done when:** `docker compose up` starts DB + Redis, `nx serve api` starts NestJS, `nx serve web` starts React, both connect.

---

### Phase 2 — Identity & Access

**Goal:** Full auth system + workspace management with RBAC.

- [ ] **TDD:** Write domain unit tests for `User`, `Workspace`, `Member` entities
- [ ] Implement domain entities to pass tests
- [ ] Implement `InMemoryUserRepository`, `InMemoryWorkspaceRepository`
- [ ] Write application layer unit tests (RegisterUser, CreateWorkspace, InviteMember)
- [ ] Implement command/query handlers
- [ ] Write Prisma repository integration tests (against test DB)
- [ ] Implement Prisma repositories
- [ ] Implement JWT strategy (RS256), refresh token rotation with Redis
- [ ] Implement RBAC guard + `@RequireRole` decorator
- [ ] Write E2E tests for auth flow
- [ ] Implement REST controllers + DTOs
- [ ] Implement invitation email (use Resend or Nodemailer)
- [ ] Build React: login page, register page, workspace creation flow
- [ ] Build React: workspace settings, member management UI

**Done when:** User can register, create a workspace, invite a member, member accepts invite, both can log in and see the workspace.

---

### Phase 3 — Project Management

**Goal:** Full issue lifecycle, board view, list view.

- [ ] **TDD:** Write domain unit tests for `Project`, `Issue`, `Status` entities
- [ ] Implement domain entities
- [ ] Implement CQRS commands: CreateProject, CreateIssue, UpdateIssue, ChangeIssueStatus, DeleteIssue
- [ ] Implement CQRS queries: GetProjectIssues (with filters), GetIssueByNumber
- [ ] Implement Prisma repositories + integration tests
- [ ] Write E2E tests for issue CRUD
- [ ] Implement REST controllers
- [ ] Build React: project creation, project list
- [ ] Build React: Kanban board (drag-and-drop with `@dnd-kit/core`)
- [ ] Build React: list view with filters (status, assignee, priority, label)
- [ ] Build React: issue detail page (full form, metadata sidebar)

**Done when:** User can create projects, create issues, drag issues between status columns, filter issues.

---

### Phase 4 — Real-Time

**Goal:** All board changes broadcast live to connected clients.

- [ ] Configure Socket.io in NestJS with Redis adapter
- [ ] Implement `IssueGateway` — subscribe to domain events, emit to project rooms
- [ ] Implement `PresenceGateway` — track who is viewing what
- [ ] Write integration tests for WebSocket event emission
- [ ] Build React: `useSocket` hook — connect on login, disconnect on logout
- [ ] Wire TanStack Query cache invalidation to WS events
- [ ] Build React: presence indicators on board (avatars on columns/issues)

**Done when:** Open two browser tabs, drag an issue in one — the other tab updates without refresh.

---

### Phase 5 — Collaboration & Notifications

**Goal:** Threaded comments, activity log, in-app notifications.

- [ ] **TDD:** Write domain unit tests for `Comment`, `Activity`, `Notification`
- [ ] Implement collaboration domain + application layer
- [ ] Implement activity log generation from domain events (listener pattern)
- [ ] Implement notification fan-out from domain events
- [ ] Build React: comment thread with markdown editor (use `@uiw/react-md-editor`)
- [ ] Build React: activity timeline on issue detail
- [ ] Build React: notification bell + feed
- [ ] Wire notifications to WS events (real-time notification delivery)

**Done when:** Comment on an issue, assignee receives in-app notification in real time.

---

### Phase 6 — Infrastructure & Production

**Goal:** Application deployed on AWS, reproducible with Terraform.

- [ ] Write Terraform `networking` module (VPC, subnets, SGs)
- [ ] Write Terraform `ecr` module + push first images
- [ ] Write Terraform `rds` module (dev: t3.micro single-AZ)
- [ ] Write Terraform `elasticache` module
- [ ] Write Terraform `ecs` module (task definition, service, IAM role for Secrets Manager)
- [ ] Write Terraform `frontend` module (S3 + CloudFront)
- [ ] Store DB credentials and JWT private key in Secrets Manager
- [ ] Configure GitHub Actions deploy pipeline (build → ECR push → ECS deploy + S3 sync)
- [ ] Configure `environments/dev` and `environments/prod`
- [ ] Write deployment runbook in README
- [ ] Add `terraform plan` as a CI check on infra PRs

**Done when:** `terraform apply` on a fresh AWS account produces a running, publicly accessible application.

---

## Appendix: Key Architectural Decisions Log

| Decision | Choice | Rejected alternative | Reason |
|---|---|---|---|
| Monorepo tool | Nx | Turborepo | First-class NestJS generators, module boundary enforcement |
| Backend framework | NestJS | Express, Go | DDD module structure, shared types with frontend |
| ORM | Prisma | TypeORM | Schema-first, keeps domain entities clean of ORM decorators |
| Auth token signing | RS256 | HS256 | Asymmetric — signing key never shared |
| Refresh token store | Redis | PostgreSQL | O(1) revocation, automatic TTL expiry |
| WS scaling | Socket.io + Redis adapter | Native WS | Multi-instance broadcast without sticky sessions |
| Container orchestration | ECS Fargate | EKS, EC2 | No OS management, no K8s overhead, right size for portfolio |
| Frontend static hosting | S3 + CloudFront | ECS-served | CDN performance, cost, separation of concerns |
| Secrets management | AWS Secrets Manager | .env files, SSM | Rotation support, IAM access control, no secrets in Terraform state |
| DB migrations strategy | Prisma Migrate | Manual SQL | Version-controlled, reproducible across environments |
