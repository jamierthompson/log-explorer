# Log Explorer

A prototype log explorer for working through an incident **without losing
your place** — where the keyboard and the mouse are equally first-class,
and the interface quietly surfaces the shortcuts that matter as the
situation changes.

It's built around a small idea: the parts of an interface that usually
get deprioritized — the keyboard surface, the acknowledgement that a
press landed, the few pixels of motion that make an action feel real —
are the work, not the decoration.

**Live case study:** _Coming soon._

The deployed page is a case study — a live, interactive prototype
embedded in a short write-up of the problem and the decisions behind it.
Start there; it carries the full story. This README is just how to run
it locally.

## What it does

- Opening a line **anchors** it and reveals a window of surrounding
  context. Multiple windows stay open at once and expand outward as you
  read.
- An **adaptive shortcut legend** shows only the bindings whose action is
  meaningful right now — and each entry is itself a button, so the
  keyboard and pointer paths trigger exactly the same thing.
- Full keyboard operation over an ARIA listbox — navigation, anchors,
  context toggling, and a `?` shortcut sheet — with mouse parity
  throughout.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- CSS Modules over a global design-token foundation
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
│   ├── features/         # Composed feature components (log-explorer, …)
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
machine, the filter reducer and its retention rule, the derived-line
visibility logic, and the UI primitives.

## License

MIT — see [LICENSE](./LICENSE).
