# Contributing

## Fixing or adding company data (no code required)

This is the easiest and most valuable way to contribute. Edit
[`src/data/dump.json`](src/data/dump.json) directly:

- **Wrong address or coordinates?** Fix them in place.
- **Company closed / office moved?** Update or remove the entry.
- **Know a Pune tech office that's missing?** Add an entry:

  ```json
  { "id": "your-company-slug", "name": "Company Name", "address": "Full address, Pune, Maharashtra", "category": "Product / R&D", "lat": 18.x, "lng": 73.x }
  ```

  `category` must be one of the values in the `Category` type in
  [`src/data/companies.ts`](src/data/companies.ts). Get `lat`/`lng` from Google Maps
  (right-click the spot → the coordinates are the first item in the context menu).

Before opening a PR, run:

```bash
npm run validate-data
```

This checks for duplicate ids, invalid categories, missing fields, and coordinates outside
Pune's bounds. Fix any errors it reports; warnings (e.g. possible duplicate names) are worth a
look but won't block the PR.

For bulk data discovery via the Google Places API instead of hand-editing, see
[`data/README.md`](data/README.md).

## Code changes

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and add a Mapbox token.
3. `npm run dev`
4. Before opening a PR: `npm run lint` and `npm run build` should both pass clean.

Keep `src/` limited to webapp code and the single `dump.json` data file — data-pipeline tooling
belongs in `scripts/` and `data/`, not `src/`.

## Reporting issues

Open a GitHub issue. For data-quality reports (wrong address, closed office, miscategorized
company), a Google Maps link or the office's GMaps name is the fastest way to confirm.
