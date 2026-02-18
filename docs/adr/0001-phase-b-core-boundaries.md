# ADR 0001: Phase B core boundaries

## Status
Accepted

## Date
2026-02-18

## Context
The repo moved to a monorepo (`apps/web`, `apps/api`, `packages/core`), but part of domain/use-case logic still lived in `apps/web` utilities.

## Decision
Consolidate shared domain and pure use-cases in `packages/core` and expose them through a single public entrypoint (`@repo/core`).

### Included in core
- Diagram parsing/serialization/validation and detection utilities.
- Shared domain models (tabs, theme, history, share, export, command).
- Shared catalogs (`TEMPLATES`, `SYNTAX_REFERENCE`, `SAMPLE_DIAGRAM`).
- Error helpers (`formatError`, `parseErrorLine`).
- Share payload codec (`encodeShareState`, `decodeShareState`).
- Flowchart composer use-cases (add/update/remove/connect/direction).

### Kept out of core
- Browser side effects (`localStorage`, URL history mutations).
- Mermaid renderer setup and icon pack fetch.
- React hooks/components and UI-specific state orchestration.
- Browser export adapters (PNG/PDF/clipboard/embed).

## Consequences
- `apps/web` and `apps/api` now depend on one shared API surface.
- Domain behavior is easier to test in isolation under `packages/core`.
- App code remains focused on UI/infra adapters.
