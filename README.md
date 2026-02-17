# Mermaid Editor

A browser-based editor for creating Mermaid diagrams with live preview and high-resolution export.

## Features

- **Live Preview** -- diagrams render as you type with 400ms debounce
- **Multi-Tab Editing** -- work on multiple diagrams simultaneously, persisted to localStorage
- **Export** -- download as PNG (up to 4x resolution) or SVG, or copy to clipboard
- **Shareable URLs** -- generate a compressed link encoding your diagram and theme
- **Template Gallery** -- start from pre-built templates for common diagram types
- **Dark / Light Theme** -- toggle between themes with matching Mermaid styles
- **Keyboard Shortcuts** -- Cmd+N (new tab), Cmd+W (close tab), Cmd+S (export), Cmd+Shift+[ / ] (switch tabs)
- **Resizable Panels** -- drag the split handle between editor and preview

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

No bundler configuration needed -- Bun serves HTML that imports `.tsx` directly.

## License

MIT
