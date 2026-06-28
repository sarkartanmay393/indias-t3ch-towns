import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { namedCompanies } from "../src/data/namedCompanies.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error("Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY in your environment or .env.local.");
  process.exit(1);
}

const PUNE_LOCATION = "18.5204,73.8567";
const PUNE_RADIUS_M = 25000;
// Loose bbox used to sanity-check results — global companies often return
// their (non-Pune) HQ as the top match despite the location bias.
const PUNE_BBOX = { minLng: 73.6, maxLng: 74.1, minLat: 18.35, maxLat: 18.75 };

const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

function buildQuery(name) {
  // Strip parentheticals — they're disambiguation hints for humans, not useful
  // (and sometimes harmful) as part of a Places text query.
  const clean = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  return `${clean} Pune office`;
}

function isInPune(place) {
  const addr = (place.formatted_address ?? "").toLowerCase();
  if (addr.includes("pune")) return true;
  const { lat, lng } = place.geometry?.location ?? {};
  if (lat == null || lng == null) return false;
  return lat >= PUNE_BBOX.minLat && lat <= PUNE_BBOX.maxLat && lng >= PUNE_BBOX.minLng && lng <= PUNE_BBOX.maxLng;
}

async function searchOne(name) {
  const params = new URLSearchParams({
    key: apiKey,
    query: buildQuery(name),
    location: PUNE_LOCATION,
    radius: String(PUNE_RADIUS_M),
  });
  const res = await fetch(`${TEXT_SEARCH_URL}?${params}`);
  if (!res.ok) throw new Error(`Google Places request failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.length) return null;
  // Prefer the first result that actually checks out as Pune; fall back to
  // the top result only if nothing in the page passes the Pune check.
  return data.results.find(isInPune) ?? null;
}

const resolved = [];
const notFound = [];

for (const { name, category } of namedCompanies) {
  const place = await searchOne(name);
  if (!place) {
    console.warn(`✗ ${name}: no Pune-verified match`);
    notFound.push(name);
    continue;
  }
  console.log(`✓ ${name} -> ${place.formatted_address}`);
  resolved.push({
    id: place.place_id,
    name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    category,
    source: "google-named",
  });
  // Stay well under Google's QPS limits.
  await new Promise((r) => setTimeout(r, 150));
}

const outPath = path.join(__dirname, "../src/data/companies.named.json");
fs.writeFileSync(outPath, JSON.stringify(resolved, null, 2));
console.log(`\nResolved ${resolved.length}/${namedCompanies.length} to a Pune address.`);
if (notFound.length) {
  console.log(`\nNot found / no Pune match (${notFound.length}) — add manually if you have a real address:`);
  for (const n of notFound) console.log(`  - ${n}`);
}
