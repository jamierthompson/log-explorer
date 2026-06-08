/** `HH:MM:SS` in UTC, zero-padded. */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds(),
  )}`;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/** `DAY · MON DD` in UTC, e.g. `MON · MAY 11`. */
export function formatDayLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return `${DAY_NAMES[d.getUTCDay()]} · ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
