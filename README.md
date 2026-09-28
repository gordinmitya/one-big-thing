# One Big Thing

A tiny 1-3-5 daily planner: **1** big thing, **3** medium things, and a list of small things.
Every day (local time) starts on a blank page. Past days live in the archive (top-left).

Fully local: no backend, no accounts. Data is stored in your browser's `localStorage`.

## Develop

```sh
bun install
bun run dev      # http://localhost:5173
bun run build    # outputs to dist/
```

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Keys

- `Enter`: jump to the next field
- `Backspace` on an empty small thing: remove it
