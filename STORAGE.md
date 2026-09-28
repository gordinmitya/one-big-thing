# Storage contract

All data lives in the browser's `localStorage`. There is no server.
This file is the source of truth for the on-disk format; `src/storage.ts` implements it
and `src/storage.test.ts` pins it. Change all three together.

## Stability rules

1. **Additive only within a version.** New optional fields may be added. Existing fields
   never change meaning or type.
2. **Unknown fields are preserved.** Readers keep fields they don't understand, so an
   older build never erases data written by a newer one.
3. **Breaking change = new key.** Bump the key suffix (`v1` → `v2`), keep reading the old
   key, migrate on load, and add the migration to the changelog below.
4. **Readers are lenient.** Missing or malformed values fall back to empty ones instead
   of throwing.

## Keys

### `obt.days.v1`

JSON object mapping a local-timezone date to that day's plan.

```ts
type Days = Record<DateKey, Day>; // DateKey = "yyyy-mm-dd", local time

type Day = {
  big: Item;                   // the one big thing
  medium: [Item, Item, Item];  // always exactly 3
  small: Item[];               // any length, in display order, no empty items
};

type Item = {
  text: string;  // as typed; may contain newlines
  done: boolean;
};
```

- A day with no non-blank text is **not stored** (its key is deleted).
- `medium` slots may hold empty items (`{ "text": "", "done": false }`) so positions are kept.
- `small` never contains items with blank text.

Example:

```json
{
  "2026-09-27": {
    "big": { "text": "Create slide deck for the big meeting", "done": true },
    "medium": [
      { "text": "Sign the contracts", "done": true },
      { "text": "Email vendors", "done": false },
      { "text": "", "done": false }
    ],
    "small": [{ "text": "Laundry", "done": false }]
  }
}
```

### `obt.lastSeen`

Plain string `yyyy-mm-dd`: the local date the app was last opened. Used only to play the
new-day transition. Safe to delete.

## Changelog

- **v1 (2026-09-28)**: initial format. Items that are plain strings (pre-release builds,
  before the done button existed) are read as `{ "text": <string>, "done": false }`.
