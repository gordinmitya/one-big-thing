/** localStorage persistence. Implements the contract in STORAGE.md; keep them in sync. */
import { type Day, type Item, emptyDay, isEmpty } from "./model";

export const DAYS_KEY = "obt.days.v1";
export const LAST_SEEN_KEY = "obt.lastSeen";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Reads an item leniently. Plain strings are the pre-release format. Unknown fields are kept. */
export function parseItem(v: unknown): Item {
  if (typeof v === "string") return { text: v, done: false };
  if (!isObj(v)) return { text: "", done: false };
  return { ...v, text: typeof v.text === "string" ? v.text : "", done: v.done === true };
}

/** Reads a day leniently, always returning the full shape. Unknown fields are kept. */
export function parseDay(v: unknown): Day {
  if (!isObj(v)) return emptyDay();
  const m = Array.isArray(v.medium) ? v.medium : [];
  return {
    ...v,
    big: parseItem(v.big),
    medium: [parseItem(m[0]), parseItem(m[1]), parseItem(m[2])],
    small: (Array.isArray(v.small) ? v.small : []).map(parseItem).filter((i) => i.text.trim()),
  };
}

export function parseDays(raw: string | null): Record<string, Day> {
  try {
    const obj: unknown = JSON.parse(raw ?? "{}");
    if (!isObj(obj)) return {};
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, parseDay(v)]));
  } catch {
    return {};
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

const days = parseDays(read(DAYS_KEY));

export function getDay(date: string): Day {
  return structuredClone(days[date] ?? emptyDay());
}

export function saveDay(date: string, day: Day) {
  if (isEmpty(day)) delete days[date];
  else days[date] = structuredClone({ ...day, small: day.small.filter((i) => i.text.trim()) });
  write(DAYS_KEY, JSON.stringify(days));
}

/** Stored days other than `exclude`, newest first. */
export function pastDays(exclude: string): [string, Day][] {
  return Object.keys(days)
    .filter((d) => d !== exclude)
    .sort()
    .reverse()
    .map((d) => [d, getDay(d)]);
}

export const getLastSeen = () => read(LAST_SEEN_KEY);
export const setLastSeen = (date: string) => write(LAST_SEEN_KEY, date);
