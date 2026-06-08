export type OpenContext = {
  readonly selectedLineId: string;
  readonly range: number;
};

export const DEFAULT_CONTEXT_RANGE = 20;
export const CONTEXT_RANGE_STEP = 20;

/**
 * Whether the window already covers the loaded data on both sides of
 * the anchor. The bound is the longer side: range grows symmetrically
 * but the shorter side clamps at the file edge first; once range meets
 * the longer distance, both sides are exhausted.
 */
export function isAtFileBoundary(
  anchorIndex: number,
  currentRange: number,
  totalLines: number,
): boolean {
  if (anchorIndex < 0 || anchorIndex >= totalLines) return true;
  const maxDistance = Math.max(anchorIndex, totalLines - 1 - anchorIndex);
  return currentRange >= maxDistance;
}
