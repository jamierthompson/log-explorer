/*
 * Queries for the guided experience's machine hooks. Cross-component
 * assertions anchor on the stable ids the components expose rather
 * than on their prose, so a copy rewrite can't silently break a test
 * that isn't about the copy.
 */
export function getGuideStep(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-guide-step="${id}"]`);
  if (!el) throw new Error(`No guide step found for "${id}"`);
  return el;
}
