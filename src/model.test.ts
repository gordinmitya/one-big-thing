import { expect, test } from "bun:test";
import { addDays } from "./model";

test("addDays crosses month and year boundaries", () => {
  expect(addDays("2026-09-28", 1)).toBe("2026-09-29");
  expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
});
