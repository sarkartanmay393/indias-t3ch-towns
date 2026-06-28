A map of Pune showing tech company office locations, built with Next.js and Mapbox GL JS.

## Pune Tech Office Map

1. Copy `.env.local.example` to `.env.local` and fill in a Mapbox access token from https://account.mapbox.com/access-tokens/.
2. Edit `src/data/companies.ts` to add/remove offices (name + address). Addresses are a best-effort draft — verify before relying on them.
3. Run `npm run geocode` to resolve addresses to coordinates within Pune's bounding box. This writes `src/data/companies.geocoded.json` (regenerate it any time the company list changes).
4. `npm run dev` and open http://localhost:3000 — the map is locked to Pune's bounds so nothing else is reachable by panning/zooming.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
