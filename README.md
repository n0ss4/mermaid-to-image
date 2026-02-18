# Mermaid Monorepo

Monorepo powered by Bun workspaces.

## Workspace layout

- `apps/web` -- Mermaid editor frontend (React + Bun)
- `apps/api` -- Bun API for diagram parse/serialize/validate
- `packages/core` -- Shared diagram domain logic

## Core API surface (`@repo/core`)

`packages/core` is the single shared API for:

- Diagram domain: parse/serialize/validate/detection/outline/svg helpers
- Editor domain models: tab/theme/history/share/export/command
- Shared catalogs: `TEMPLATES`, `SYNTAX_REFERENCE`, `SAMPLE_DIAGRAM`
- Error helpers: `formatError`, `parseErrorLine`
- Share codec: `encodeShareState`, `decodeShareState`
- Flowchart composer use cases: add/update/remove/connect/direction operations

Browser/IO concerns stay in `apps/web` (`localStorage`, DOM, mermaid renderer, exporters).

## Install

```bash
bun install
```

## Development

```bash
bun run dev:web   # Web app at http://localhost:3000
bun run dev:api   # API at http://localhost:3001
```

Run both:

```bash
bun run dev
```

## Build

```bash
bun run build
```

## Test

```bash
bun run test
```

## Typecheck

```bash
bun run typecheck
```
