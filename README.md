# Log Explorer

A log explorer prototype for investigating an incident **without losing
your place**. In most log viewers, every look at a line's context opens
another tab — your filter doesn't come along, and a few clicks in you're
holding the timeline together in your head. Here, context opens in
place, under the filter you set, so the investigation never scatters.

It's built around a small idea: the parts of an interface that usually
get deprioritized — the keyboard surface, the acknowledgement that a
press landed, the few pixels of motion that make an action feel real —
are the work, not the decoration.

**Live case study:** [log-explorer.onrender.com](https://log-explorer.onrender.com)

The deployed page is a guided case study: a checkout incident
investigated live in the prototype, first the old way (a tab for every
click), then in place — followed by the build story and the reasoning
behind each decision. Start there; it carries the full story. This
README is just how to run it locally.

## What it does

- Opening a line **anchors** it and reveals the surrounding context. Multiple contexts stay open at once and expand outward as you
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
- Radix UI (Dialog, ScrollArea, Tabs)
- Vitest + React Testing Library
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Testing

```bash
pnpm test           # single run
pnpm test:watch     # watch mode
```

Coverage spans both domains. On the component side: the listbox
keyboard handler, the context-window state machine, the filter reducer
and its retention rule, the derived-line visibility logic, and the UI
primitives — plus invariants of the incident's mock data, pinned as
tests so the narrative can't drift from what the logs show. On the
site side: the guided two-act flow, including one integration test
that drives the whole journey (filter, open contexts, call the root
cause, miss, recover, replay to a fresh start), along with view
routing, focus management, and the live-region announcements.

## License

MIT — see [LICENSE](./LICENSE).
