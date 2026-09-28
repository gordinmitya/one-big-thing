import { expect, test } from "bun:test";
import { emptyDay } from "./model";
import { parseDay, parseDays, pastDays, prune, saveDay } from "./storage";

test("reads the v1 format", () => {
  const raw = JSON.stringify({
    "2026-09-27": {
      big: { text: "Big", done: true },
      medium: [{ text: "A", done: false }, { text: "", done: false }, { text: "C", done: true }],
      small: [{ text: "s1", done: false }],
    },
  });
  expect(parseDays(raw)).toEqual({
    "2026-09-27": {
      big: { text: "Big", done: true },
      medium: [{ text: "A", done: false }, { text: "", done: false }, { text: "C", done: true }],
      small: [{ text: "s1", done: false }],
    },
  });
});

test("migrates pre-release plain strings", () => {
  expect(parseDay({ big: "Big", medium: ["A", "", "C"], small: ["s1"] })).toEqual({
    big: { text: "Big", done: false },
    medium: [{ text: "A", done: false }, { text: "", done: false }, { text: "C", done: false }],
    small: [{ text: "s1", done: false }],
  });
});

test("keeps unknown fields", () => {
  const day = parseDay({ big: { text: "x", done: false, color: "red" }, mood: 5 });
  expect(day).toMatchObject({ mood: 5, big: { text: "x", done: false, color: "red" } });
});

test("is lenient with garbage", () => {
  expect(parseDays("not json")).toEqual({});
  expect(parseDays("[]")).toEqual({});
  const day = parseDay({ big: 42, medium: "nope", small: [null, "", "ok"] });
  expect(day.big).toEqual({ text: "", done: false });
  expect(day.medium).toHaveLength(3);
  expect(day.small).toEqual([{ text: "ok", done: false }]);
});

test("pastDays leaves out today and tomorrow", () => {
  for (const date of ["2026-09-27", "2026-09-28", "2026-09-29"]) saveDay(date, { ...emptyDay(), big: { text: date, done: false } });
  expect(pastDays("2026-09-28").map(([d]) => d)).toEqual(["2026-09-27"]);
});

test("prune drops days older than two weeks", () => {
  for (const date of ["2026-09-13", "2026-09-14", "2026-09-27"]) saveDay(date, { ...emptyDay(), big: { text: date, done: false } });
  prune("2026-09-28");
  expect(pastDays("2026-09-28").map(([d]) => d)).toEqual(["2026-09-27", "2026-09-14"]);
});
