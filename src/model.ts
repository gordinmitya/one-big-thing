export type Item = { text: string; done: boolean };
export type Day = { big: Item; medium: [Item, Item, Item]; small: Item[] };

export const emptyItem = (): Item => ({ text: "", done: false });
export const emptyDay = (): Day => ({ big: emptyItem(), medium: [emptyItem(), emptyItem(), emptyItem()], small: [] });

export const filledItems = (day: Day): Item[] =>
  [day.big, ...day.medium, ...day.small].filter((i) => i.text.trim());

export const isEmpty = (day: Day): boolean => filledItems(day).length === 0;

export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toDate(date: string, offset = 0): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d + offset);
}

export const addDays = (date: string, n: number): string => localDate(toDate(date, n));

export const isDateKey = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s);

export const weekday = (date: string): string => toDate(date).toLocaleDateString(undefined, { weekday: "long" });
