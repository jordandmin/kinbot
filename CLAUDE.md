# KinBot

Self-hosted platform of specialized AI agents (Kins) for individuals and small groups. Each Kin has a persistent identity, expertise, memory, and tools. Kins share a single continuous session (no "new conversation"), collaborate with each other, spawn sub-Kins for tasks, and execute scheduled jobs.

## Documentation map

Read these files **before starting any phase**. They are the source of truth.

| File | Content |
|---|---|
| `idea.md` | Full functional specification (features, UX, architecture) toujours inclure dans le contexte pour etre aligné |
| `schema.md` | Complete SQLite database schema (all tables, indexes, virtual tables) |
| `api.md` | REST API contracts (request/response for every route) + SSE events |
| `config.md` | All configurable values with env vars and defaults |
| `structure.md` | Project file tree, naming conventions, imports, i18n, error format |
| `prompt-system.md` | How the Kin system prompt is assembled (blocks 1-12) |
| `compacting.md` | Compacting algorithm + memory extraction pipeline |
| `DEVELOPMENT_PLAN.md` | Phased development plan with checkboxes — **follow this plan** |

## Tech stack

**Backend**: Bun + Hono + SQLite (bun:sqlite) + Drizzle ORM + Vercel AI SDK + Better Auth + croner
**Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Vercel AI SDK (ai/react) + i18next
**Single process, single DB file, single Docker container. Zero external infrastructure.**

## Key conventions

### Naming

- Files: `kebab-case.ts` / Components: `PascalCase.tsx`
- Types/Interfaces: `PascalCase` / Functions: `camelCase` / Constants: `SCREAMING_SNAKE_CASE`
- DB tables: `snake_case` / API routes: `kebab-case` / Env vars: `SCREAMING_SNAKE_CASE`

### Imports

Use absolute paths with tsconfig aliases:
```typescript
import { buildSystemPrompt } from '@/server/services/prompt-builder'
import type { Kin } from '@/shared/types'
```
No index barrels in deep folders — use explicit imports.

### Shared types

Any type used by both client and server goes in `src/shared/types.ts`. Any constant shared between client and server goes in `src/shared/constants.ts`.

### API errors

All API routes return JSON. Errors follow this format:
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable description" } }
```

### i18n

- Base language: English (`en.json`). Supported: `en`, `fr`
- Key convention: `namespace.element.action` (e.g. `sidebar.kins.title`)
- Use `useTranslation()` hook — never hardcode text in JSX
- Language detected from `user_profiles.language`, not the browser

### Database

- All PKs are UUIDs (text)
- All timestamps are Unix integers (milliseconds)
- Booleans stored as integer (0/1)
- Complex objects stored as text (JSON serialized)
- Better Auth tables (`user`, `session`, `account`, `verification`) are managed by Better Auth — never modify them directly

### Authentication

- Better Auth with HTTP-only cookie sessions
- Middleware on all `/api/*` routes except `/api/auth/*` and `/api/onboarding/*`
- First user created during onboarding gets `admin` role

## Architecture principles

- **Queue per Kin**: each Kin has a FIFO queue. One message processed at a time. User messages have priority over automated ones.
- **SSE is global**: one SSE connection per client, multiplexed by `kinId`. No per-Kin SSE connections.
- **Compacting**: summarizes old messages to stay within token limits. Never deletes original messages. Triggers after each LLM turn if thresholds are exceeded.
- **Memory**: dual-channel (automatic extraction pipeline + explicit Kin tools). Hybrid search (sqlite-vec KNN + FTS5 rank fusion).
- **Vault secrets**: encrypted at rest (AES-256-GCM). Never exposed in prompts — only accessible via `get_secret()` tool. Redaction blocks compacting.
- **Sub-Kins (tasks)**: ephemeral instances for delegated work. `await` mode re-enters parent queue; `async` mode deposits result as informational. Max depth configurable.
- **Inter-Kin communication**: `request`/`reply` pattern with correlation IDs. Replies are always `inform` (no ping-pong). Rate-limited.
- **Crons**: in-process scheduler (croner). Spawn sub-Kins on schedule. Results are informational (no LLM turn on parent). Kin-created crons require user approval.
- **Event bus + hooks**: foundation for observability and future plugin system.
- **Providers are pluggable**: one config per provider, multiple capabilities auto-detected (`llm`, `embedding`, `image`).

## Development workflow

1. Follow `DEVELOPMENT_PLAN.md` phase by phase — **do not skip ahead**
2. Check off tasks as you complete them (`[ ]` → `[x]`)
3. Validate each phase's criterion before moving to the next
4. One commit per completed sub-task with a clear message
5. **Phase 0.5 (design system) is BLOQUANT** for all frontend work — backend phases can proceed in parallel
6. Run `bun run dev` frequently to verify nothing is broken

## Commands

```bash
bun run dev        # Start dev servers (Vite + Hono)
bun run build      # Production build (Vite → dist/client/)
bun run start      # Production server (Hono serves API + static)
bun run db:push    # Push schema to SQLite
bun run db:migrate # Run Drizzle migrations
```

## Project structure (overview)

```
src/
  server/           # Backend (Bun + Hono)
    routes/         # REST API routes
    services/       # Business logic
    providers/      # AI provider implementations
    tools/          # Native tools exposed to Kins
    db/             # SQLite connection + Drizzle schema + migrations
    auth/           # Better Auth config + middleware
    hooks/          # Lifecycle hooks
    sse/            # SSE manager
    config.ts       # Centralized configuration
  client/           # Frontend (React + Vite)
    pages/          # Page components
    components/     # Reusable components (ui/, sidebar/, chat/, kin/, common/)
    hooks/          # Custom React hooks
    lib/            # Utilities (api client, i18n, utils)
    locales/        # i18n translation files
    styles/         # CSS (Tailwind + design tokens)
  shared/           # Code shared between client and server
    types.ts
    constants.ts
data/               # Persistent data (SQLite DB, uploads, workspaces)
```

See `structure.md` for the complete file tree.
