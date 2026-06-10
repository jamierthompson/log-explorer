/**
 * The story's sections, in document order, for the nav's table of
 * contents. Each `id` must match the `id` on the corresponding
 * <section> in story.tsx — that pairing is what lets the nav jump to a
 * section. Labels match the sections' eyebrows: the short scanning
 * names, not the sentence-like headings.
 */
export const STORY_SECTIONS = [
  { id: "the-problem", label: "The problem" },
  { id: "the-idea", label: "The idea" },
  { id: "what-i-built", label: "What I built" },
  { id: "the-cut", label: "The cut" },
  { id: "the-legend", label: "The Legend" },
  { id: "whats-next", label: "What’s next" },
  { id: "closing", label: "Closing" },
] as const;
