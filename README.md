# Log Explorer

A log explorer for browsing structured logs. Keyboard and mouse are
equally first-class: every action is reachable from either, and the UI
quietly surfaces the relevant shortcuts as you work.

**Live demo:** _Coming soon._

## Highlights

- **Adaptive Legend.** A compact toolbar that surfaces only the bindings
  whose action is meaningful for the current state. Each entry is also
  a button — clicking it performs the same action as pressing the key.
- **Anchored context windows.** With a filter active, opening a row pins
  it as an anchor and reveals a window of surrounding lines (dimmed for
  contrast). Multiple windows can stay open at once and can be expanded
  outward as you read.
- **Shortcut sheet.** A help modal (`?`) that lists every binding the
  app responds to, grouped by area.
- **Listbox navigation.** `J` / `K`, `G` / `Shift+G`, and `[` / `]` hop
  between rows and anchors. `E` / `Enter` toggles the context for the
  focused row.
- **Scenario filters.** Preset chips combine filter facets (level,
  instance, request id) with OR inside a facet and AND across facets.
  Esc clears the active filter when no context window is open.
- **Accessible by construction.** The list uses ARIA listbox semantics
  with `aria-activedescendant`, the Legend renders as a toolbar, and
  the shortcut sheet is a proper modal with focus trapping.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- CSS Modules with a global design-token foundation
- Radix UI (Dialog, ScrollArea)
- Vitest + React Testing Library
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Project structure

```
src/
├── app/                  # App Router routes
├── components/
│   ├── features/         # Composed feature components
│   │   ├── log-explorer/
│   │   ├── scenario-chips/
│   │   └── shortcut-sheet/
│   └── ui/               # Generic primitives (chip, keycap, legend)
├── lib/                  # Pure utilities (filter, derive, context, shortcuts)
├── mocks/                # Mock log fixtures
└── types/                # Shared type definitions
tests/                    # Vitest unit tests mirroring src/
```

## Testing

```bash
pnpm test           # single run
pnpm test:watch     # watch mode
```

Coverage spans the listbox keyboard handler, the context-window state
machine, the filter reducer and retention rule, the derived-line
visibility/dimming logic, and the UI primitives.

## License

MIT — see [LICENSE](./LICENSE).
