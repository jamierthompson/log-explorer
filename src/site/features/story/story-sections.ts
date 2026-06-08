/**
 * The story's sections, in document order, for the nav's table of
 * contents. Each `id` must match the `id` on the corresponding
 * <section> in story.tsx — that pairing is what lets the nav jump to a
 * section. Labels mirror the section headings for now; they can be
 * shortened independently of the headings without breaking the jump.
 */
export const STORY_SECTIONS = [
  { id: "chasing-an-id", label: "Chasing an ID across tabs" },
  { id: "the-idea", label: "The idea" },
  { id: "what-i-built", label: "What I built" },
  { id: "finding-the-real-problem", label: "Finding the real problem" },
  { id: "the-legend", label: "The Legend" },
  { id: "what-id-do-next", label: "What I’d do next" },
  { id: "what-ill-carry-forward", label: "What I’ll carry forward" },
  { id: "closing", label: "Closing" },
] as const;
