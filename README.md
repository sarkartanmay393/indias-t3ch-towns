# India's T3ch Towns

An interactive map of tech company offices across India's biggest cities — starting with Pune, expanding
to Bengaluru, Delhi, Kolkata, and Mumbai. Built with Next.js (App Router) and Mapbox GL JS.

## Getting started

1. Copy `.env.local.example` to `.env.local` and fill in a Mapbox public access token from
   https://account.mapbox.com/access-tokens/.
2. `npm install`
3. `npm run dev` and open http://localhost:3000.

The map is locked to Pune's bounds — nothing else is reachable by panning or zooming yet.

## Project structure

```
src/
  app/          Next.js App Router pages, metadata, layout
  components/   Map, sidebar, marker/popup rendering
  data/
    companies.ts   TypeScript types only (Company, Category)
    dump.json       the single source of truth — all company data the app reads
    merged.ts       re-exports dump.json as typed Company[]

scripts/        data pipeline tooling (not part of the webapp)
data/           data pipeline inputs/outputs (not part of the webapp) — see data/README.md
```

`src/` contains only webapp code plus the one data file it reads (`dump.json`). Everything that
*produces* or *grows* that data — fetch scripts, query seed lists, an unreviewed candidates inbox —
lives outside `src/`, in `scripts/` and `data/`.

## Contributing data

The fastest way to fix or add a company: edit `src/data/dump.json` directly and open a PR. Each entry is

```json
{ "id": "...", "name": "...", "address": "...", "category": "...", "lat": 18.x, "lng": 73.x }
```

Run `npm run validate-data` before committing to catch schema issues, duplicate ids, invalid categories,
or coordinates outside Pune's bounds.

For bulk discovery via the Google Places API (find companies we don't have yet, or resolve addresses for
named companies), see [`data/README.md`](data/README.md).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run validate-data` | Validate `src/data/dump.json` |
| `npm run fetch-companies` | Discover/resolve candidate companies into `data/candidates.json` |
| `npm run promote-candidates` | Merge reviewed candidates into `src/data/dump.json` |

## Deploy

Deploys cleanly to [Vercel](https://vercel.com/new) — set `NEXT_PUBLIC_MAPBOX_TOKEN` as a project
environment variable.
