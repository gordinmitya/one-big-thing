export type Day = { big: string; medium: [string, string, string]; small: string[] };

const KEY = "obt.days.v1";

type Days = Record<string, Day>;

function load(): Days {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Days;
  } catch {
    return {};
  }
}

const days: Days = load();

export const emptyDay = (): Day => ({ big: "", medium: ["", "", ""], small: [] });

export function getDay(date: string): Day {
  const d = days[date];
  return d ? { big: d.big, medium: [...d.medium], small: [...d.small] } : emptyDay();
}

export function items(day: Day): string[] {
  return [day.big, ...day.medium, ...day.small].map((s) => s.trim()).filter(Boolean);
}

export function saveDay(date: string, day: Day) {
  if (items(day).length) days[date] = day;
  else delete days[date];
  localStorage.setItem(KEY, JSON.stringify(days));
}

/** All stored dates except `exclude`, newest first. */
export function pastDates(exclude: string): string[] {
  return Object.keys(days)
    .filter((d) => d !== exclude)
    .sort()
    .reverse();
}

/** Local-timezone yyyy-mm-dd. */
export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
