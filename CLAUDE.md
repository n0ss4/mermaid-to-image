# CLAUDE.md

Use Bun exclusively. No Node.js, no npm/yarn/pnpm, no dotenv.

## Monorepo Commands

- `bun install`
- `bun run dev:web`
- `bun run dev:api`
- `bun run build`
- `bun run test`
- `bun run typecheck`

## Workspace Map

- `apps/web`: React + Bun frontend (Mermaid editor)
- `apps/api`: Bun.serve HTTP API
- `packages/core`: shared diagram/domain logic

## Conventions

- Keep browser-specific logic in `apps/web`
- Keep API transport concerns in `apps/api`
- Keep pure shared logic in `packages/core`
- Import shared code via `@repo/core`
- Use only the root export surface (`@repo/core`), avoid deep subpath imports in app code

## Phase B Boundaries

- `packages/core` owns domain + pure use cases:
  - syntax/templates catalogs
  - share codec
  - error formatting/parsing
  - flowchart composer operations
- `apps/web` owns UI + browser infra:
  - mermaid rendering
  - localStorage/history URL side-effects
  - canvas/export adapters and React hooks/components
