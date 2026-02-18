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
- **Compression:** lz-string (for shareable URLs)
- **Icons:** Lucide React

## Conventions

- Prefer `Bun.file` over `node:fs`
- Use `bun:test` with `import { test, expect, describe } from "bun:test"`
- HTML files import `.tsx` directly -- Bun bundles automatically
- Bun auto-loads `.env` -- no dotenv needed
- Use `Bun.$\`cmd\`` instead of execa

## Architecture (MVVM)

The app follows a strict **Model-View-ViewModel** pattern:

- **Models** (`src/models/`) -- Pure data types and business logic (e.g., `Tab.ts` has a Redux-style reducer with actions like `ADD_TAB`, `CLOSE_TAB`, `SET_ACTIVE`, `UPDATE_TAB`, `RENAME_TAB`)
- **Services** (`src/services/`) -- Framework-agnostic classes implementing interfaces defined in `services/interfaces.ts`. Registered in `registry.ts` and provided via React Context (`ServiceProvider`). Includes: `StorageService`, `MermaidRenderService`, `ShareService`, `ExportService`, `FileService`, `ClipboardService`
- **Exporters** (`src/export/`) -- Export format implementations (PNG download, SVG download, PNG clipboard, SVG clipboard) implementing the `Exporter` interface
- **ViewModels** (`src/viewmodels/`) -- Custom React hooks (e.g., `useEditorViewModel`, `useTabViewModel`, `usePreviewViewModel`, `useExportViewModel`) that manage UI state and depend on services injected from context. Stateful DOM-bound logic (e.g., gesture tracking) is extracted into standalone hooks (`useGestureControl`) consumed by the parent viewmodel. `AppViewModel.ts` contains `useKeyboardShortcuts` and `useUrlHydration`
- **Views** (`src/views/`) -- React components that receive viewmodel values as props; no direct business logic
- **Providers** (`src/viewmodels/providers/`) -- Context providers composing services + viewmodels. Nested in `AppProvider`: `ToastProvider` > `ServiceProvider` > `ThemeProvider` > `TabProvider` > `EditorProvider`
- **Utilities** (`src/utils/`) -- Templates, constants, sharing helpers, error formatting
- **Language** (`src/lang/`) -- CodeMirror language definition for Mermaid syntax highlighting

### Data Flow

```
src/index.ts (Bun.serve + HMR)
  -> src/index.html (imports frontend.tsx)
    -> src/frontend.tsx (creates service registry, mounts AppProvider)
      -> App.tsx (orchestrates Header, TabBar, EditorPanel, PreviewPanel)
```

Editor input -> `EditorViewModel.setCode()` -> debounced (400ms) `MermaidRenderService.render()` -> SVG stored in state -> Preview updates reactively.

Preview interactions (pan, pinch-to-zoom, wheel zoom) are handled by `useGestureControl` hook -> updates `zoom`/`pan` state in `usePreviewViewModel` -> CSS transform on preview canvas.

Tab state persists to localStorage via `StorageService` with 300ms debounce. Theme persists to localStorage separately.

### Keyboard Shortcuts

Alt-based: `Alt+N` (new tab), `Alt+W` (close tab), `Alt+S` (export PNG), `Alt+=` (zoom in), `Alt+-` (zoom out), `Alt+0` (fit to view). Ctrl/Cmd-based: `Ctrl/⌘+Shift+[` / `]` (prev/next tab), `Ctrl/⌘+/` (shortcuts modal). `Escape` closes modals/fullscreen.

### Adding New Features

1. **New service:** Define interface in `services/interfaces.ts`, implement class, register in `registry.ts`
2. **New state/logic:** Create viewmodel hook in `viewmodels/`, wrap in provider in `providers/`, add to `AppProvider` chain
3. **New UI:** Add view component in `views/`, receive viewmodel values as props
4. **New export format:** Implement `Exporter` interface, register in `ExportService`
5. **New interaction logic:** Extract into a standalone hook (e.g., `useGestureControl`) that receives state + setters as args, and consume it from the parent viewmodel

## Tests

Tests live in `src/__tests__/` mirroring the source structure (e.g., `src/__tests__/models/Diagram.test.ts`). Config constants are in `src/utils/constants.ts`.
