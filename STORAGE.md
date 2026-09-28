# Storage

`localStorage`, implemented in `src/storage.ts`, pinned by `src/storage.test.ts`.

Rules:
- only add optional fields within a version
- keep unknown fields
- breaking change → new key + migration

## `obt.days.v1`

```ts
type Days = Record<string, Day>; // "yyyy-mm-dd", local time
type Day = { big: Item; medium: [Item, Item, Item]; small: Item[] };
type Item = { text: string; done: boolean };
```

- days without text are not stored
- `medium` is always 3 items, may be empty
- `small` has no empty items
- legacy: a string item reads as `{ text, done: false }`

## `obt.lastSeen`

`"yyyy-mm-dd"`, last open date. Only drives the new-day animation.
