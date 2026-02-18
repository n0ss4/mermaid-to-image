# Mermaid Editor

A browser-based editor for creating Mermaid diagrams with live preview and high-resolution export.

## Features

- **Live Preview** -- diagrams render as you type with 400ms debounce
- **Multi-Tab Editing** -- work on multiple diagrams simultaneously (up to 20), persisted to localStorage; rename tabs by double-clicking
- **Export** -- download as PNG (1x-8x resolution) or SVG, or copy either format to clipboard
- **Shareable URLs** -- generate a compressed link encoding your diagram and theme
- **Template Gallery** -- start from pre-built templates for common diagram types (Basic, Data, Project categories)
- **Dark / Light Theme** -- toggle between app themes with matching Mermaid styles (default, dark, forest, neutral)
- **Pan & Zoom** -- mouse wheel zoom, click-drag pan, and multi-touch pinch-to-zoom with fit-to-view / fit-to-width controls
- **Fullscreen Preview** -- expand preview panel to full screen (Escape to exit)
- **File Import** -- drag-and-drop or click to import `.mmd`, `.mermaid`, `.md`, `.txt` files
- **Resizable Panels** -- drag the split handle between editor and preview
- **Keyboard Shortcuts** -- Alt+N (new tab), Alt+W (close tab), Alt+S (export PNG), Alt+±/0 (zoom), Ctrl/⌘+Shift+[/] (switch tabs), Ctrl/⌘+/ (show shortcuts)
- **Error Highlighting** -- syntax errors shown inline with gutter markers and formatted error banner

### Supported Diagram Types

Flowchart, Sequence, Class, State, ER, Gantt, Pie, Git Graph, Mindmap, Timeline

## Quick Start

```bash
bun install
bun --hot src/index.ts
```

Open http://localhost:3000

## Running Tests

```bash
bun test
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Frontend | React 19 |
| Editor | CodeMirror 6 |
| Diagrams | Mermaid 11 |
| Icons | Lucide React |
| URL Sharing | lz-string |
| Architecture | MVVM (Models, Views, ViewModels, Services) |

No bundler configuration needed -- Bun serves HTML that imports `.tsx` directly.

## Architecture

The app follows a strict **MVVM** pattern:

- **Models** -- pure data types and business logic (Tab reducer, Diagram detection, SVG parsing)
- **Services** -- framework-agnostic classes for I/O (storage, render, share, export, clipboard, file)
- **ViewModels** -- React hooks managing UI state; stateful DOM logic (e.g., gesture tracking) is extracted into standalone hooks consumed by parent viewmodels
- **Views** -- React components receiving viewmodel values as props

```
Bun.serve (index.ts)
  -> index.html -> frontend.tsx -> AppProvider
    -> App.tsx (Header, TabBar, EditorPanel, PreviewPanel)
```

## License

MIT
