# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Use Bun exclusively. No Node.js, no npm/yarn/pnpm, no dotenv.

## Commands

- `bun install` -- install deps
- `bun --hot src/index.ts` -- dev server with HMR (http://localhost:3000)
- `bun test` -- run all tests
- `bun test src/__tests__/models/Tab.test.ts` -- run a single test file

## Stack

- **Runtime:** Bun
- **Frontend:** React 19 via Bun HTML imports (no Vite)
- **Diagrams:** Mermaid 11
- **Server:** `Bun.serve()` (no Express)
- **Editor:** CodeMirror 6
- **State:** React Context + custom hooks (MVVM)

## Conventions

- Prefer `Bun.file` over `node:fs`
- Use `bun:test` with `import { test, expect, describe } from "bun:test"`
- HTML files import `.tsx` directly -- Bun bundles automatically
- Bun auto-loads `.env` -- no dotenv needed
- Use `Bun.$\`cmd\`` instead of execa

## Architecture (MVVM)

The app follows a strict **Model-View-ViewModel** pattern:

- **Models** (`src/models/`) -- Pure data types and business logic (e.g., `Tab.ts` has a Redux-style reducer with actions like `ADD_TAB`, `CLOSE_TAB`, `SET_ACTIVE`, `UPDATE_TAB`, `RENAME_TAB`)
- **Services** (`src/services/`) -- Business logic classes implementing interfaces defined in `services/interfaces.ts`. Registered in `registry.ts` and provided via React Context (`ServiceProvider`)
- **ViewModels** (`src/viewmodels/`) -- Custom React hooks (e.g., `useEditorViewModel`, `useTabViewModel`) that manage UI state and depend on services injected from context
- **Views** (`src/views/`) -- React components that receive viewmodel values as props; no direct business logic
- **Providers** (`src/viewmodels/providers/`) -- Context providers composing services + viewmodels. Nested in `AppProvider`: `ServiceProvider` > `ThemeProvider` > `TabProvider` > `EditorProvider`

### Data Flow

```
src/index.ts (Bun.serve + HMR)
  -> src/index.html (imports frontend.tsx)
    -> src/frontend.tsx (creates service registry, mounts AppProvider)
      -> App.tsx (orchestrates Header, TabBar, EditorPanel, PreviewPanel)
```

Editor input -> `EditorViewModel.setCode()` -> debounced (400ms) `MermaidRenderService.render()` -> SVG stored in state -> Preview updates reactively.

Tab state persists to localStorage via `StorageService` with 300ms debounce.

### Adding New Features

1. **New service:** Define interface in `services/interfaces.ts`, implement class, register in `registry.ts`
2. **New state/logic:** Create viewmodel hook in `viewmodels/`, wrap in provider in `providers/`, add to `AppProvider` chain
3. **New UI:** Add view component in `views/`, receive viewmodel values as props
4. **New export format:** Implement `Exporter` interface, register in `ExportService`

## Tests

Tests live in `src/__tests__/` mirroring the source structure (e.g., `src/__tests__/models/Diagram.test.ts`). Config constants are in `src/utils/constants.ts`.
