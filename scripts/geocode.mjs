import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const token = process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  console.error(
    "Missing Mapbox token. Set MAPBOX_TOKEN (or NEXT_PUBLIC_MAPBOX_TOKEN) in your environment or .env.local."
  );
  process.exit(1);
}

// Pune bounding box: [minLng, minLat, maxLng, maxLat] — biases/filters geocoding results.
const PUNE_BBOX = "73.74,18.43,73.99,18.65";

const { companies } = await import(path.join(__dirname, "../src/data/companies.ts"));

const results = [];
for (const company of companies) {
  const query = encodeURIComponent(company.address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&bbox=${PUNE_BBOX}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Geocoding failed for "${company.name}": ${res.status} ${res.statusText}`);
    results.push({ ...company });
    continue;
  }
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    console.warn(`No match for "${company.name}" (${company.address}) within Pune bbox.`);
    results.push({ ...company });
    continue;
  }
  const [lng, lat] = feature.center;
  console.log(`✓ ${company.name}: [${lng}, ${lat}]`);
  results.push({ ...company, lng, lat });
}

const outPath = path.join(__dirname, "../src/data/companies.geocoded.json");
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nWrote ${results.length} entries to ${path.relative(process.cwd(), outPath)}`);
