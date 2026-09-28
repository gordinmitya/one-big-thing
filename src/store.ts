export type Item = { text: string; done: boolean };
export type Day = { big: Item; medium: [Item, Item, Item]; small: Item[] };

const KEY = "obt.days.v1";

type Days = Record<string, Day>;

/** Accepts both current items and the older plain-string format. */
const toItem = (v: unknown): Item =>
  typeof v === "string" ? { text: v, done: false } : { text: String((v as Item)?.text ?? ""), done: !!(v as Item)?.done };

function normalize(d: Partial<Record<keyof Day, unknown>>): Day {
  const m = Array.isArray(d.medium) ? d.medium : [];
  return {
    big: toItem(d.big),
    medium: [toItem(m[0]), toItem(m[1]), toItem(m[2])],
    small: (Array.isArray(d.small) ? d.small : []).map(toItem),
  };
}

function load(): Days {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, object>;
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, normalize(v)]));
  } catch {
    return {};
  }
}

const days: Days = load();

export const emptyItem = (): Item => ({ text: "", done: false });

export function getDay(date: string): Day {
  return structuredClone(days[date] ?? normalize({}));
}

export function items(day: Day): Item[] {
  return [day.big, ...day.medium, ...day.small].filter((i) => i.text.trim());
}

export function saveDay(date: string, day: Day) {
  if (items(day).length) days[date] = structuredClone(day);
  else delete days[date];
  try {
    localStorage.setItem(KEY, JSON.stringify(days));
  } catch {}
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
