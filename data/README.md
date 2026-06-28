# Data pipeline

The webapp only ever reads one file: [`src/data/dump.json`](../src/data/dump.json). Everything in this
directory is tooling that feeds *into* that file — it is not read by the app at runtime.

```
data/
  sources/
    localities.json           # Pune locality names used as discovery query seeds
    sectors.json               # sector-qualified query terms (e.g. "fintech company")
    landmarks.json              # named IT-park / landmark query strings
    requested-companies.json   # maintainer-curated wishlist: { name, category }
  candidates.json              # generated — unreviewed inbox, see below
```

## Why a separate inbox?

`src/data/dump.json` is the trusted, crowdsourced source of truth. Anyone can open a PR editing it
directly to fix an address or add a company they know about by hand — that's the primary contribution
path and needs no tooling.

Bulk discovery via the Google Places API is *not* trustworthy enough to merge automatically (wrong
branches, stale addresses, name collisions), so it lands in `data/candidates.json` instead — a
generated, gitignored scratch file — for a human to review before promotion.

## Workflow

```bash
# 1. Find new candidates (discovery + named-company resolution), written to data/candidates.json
npm run fetch-companies

#    Optional flags:
#    npm run fetch-companies -- --discover-only   # only broad locality/sector/landmark search
#    npm run fetch-companies -- --resolve-only     # only resolve data/sources/requested-companies.json

# 2. Review/edit data/candidates.json by hand — fix categories, drop bad matches, correct addresses.

# 3. Promote reviewed entries into src/data/dump.json (skips anything already present, drains the inbox)
npm run promote-candidates

# 4. Validate the merged result
npm run validate-data
```

Both phases of `fetch-companies` dedupe against `src/data/dump.json` (by Google place id and a
normalized name match), so re-running the script never re-suggests something already promoted.

## Adding a company to the wishlist

If you know a company has a Pune office but don't know its address, add `{ "name": "...", "category": "..." }`
to `data/sources/requested-companies.json` and run `npm run fetch-companies -- --resolve-only`. The script
looks it up via Google Places and validates the result actually falls within Pune's bounding box before
suggesting it — global brands' top search result is often a different city's office.

## Requires

`GOOGLE_MAPS_API_KEY` in `.env.local` (see [`.env.local.example`](../.env.local.example)). Not needed to
run the webapp itself — only for `fetch-companies`.
