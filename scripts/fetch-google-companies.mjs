import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error("Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY in your environment or .env.local.");
  process.exit(1);
}

// Pune center + radius covering the main IT corridors (Hinjewadi, Kharadi,
// Magarpatta/Hadapsar, Baner, Viman Nagar, Kalyani Nagar, Yerwada, Pimpri-Chinchwad).
const PUNE_LOCATION = "18.5204,73.8567";
const PUNE_RADIUS_M = 20000;

// Broad, then locality-qualified, then sector-qualified, then named-landmark
// queries — generic citywide terms alone missed smaller/specialized offices
// (e.g. a Baner-based cleantech startup never surfaced under "software company").
const LOCALITIES = [
  "Baner",
  "Aundh",
  "Kothrud",
  "Wakad",
  "Pimple Saudagar",
  "Bavdhan",
  "Viman Nagar",
  "Kalyani Nagar",
  "Yerwada",
  "Hinjewadi",
  "Kharadi",
  "Magarpatta",
  "Hadapsar",
  "Senapati Bapat Road",
  "Shivaji Nagar",
  "Bibwewadi",
  "NIBM Road",
  "Wagholi",
  "Bhosari",
  "Pimpri Chinchwad",
];

const SECTORS = [
  "fintech company",
  "renewable energy company",
  "cleantech company",
  "EV technology company",
  "AI company",
  "SaaS company",
  "product engineering company",
  "BPO company",
  "KPO company",
  "engineering R&D center",
  "global capability center",
  "data analytics company",
  "cybersecurity company",
  "gaming company",
  "edtech company",
  "healthtech company",
  "biotech company",
];

const LANDMARKS = [
  "EON IT Park Kharadi",
  "World Trade Center Kharadi Pune",
  "Cybercity Magarpatta",
  "Panchshil Business Park Pune",
  "Tech Park One Yerwada",
  "Commerzone Yerwada Pune",
  "ICC Trade Tower Senapati Bapat Road",
  "Weikfield IT Park Pune",
  "Teerth Technospace Pune",
  "Gigaspace Baner",
  "Lunkad IT Park Viman Nagar",
  "Pan Card Club Road Baner",
];

const QUERIES = [
  "software company",
  "IT company",
  "tech company",
  "software park",
  "IT park",
  "startup office",
  ...LOCALITIES.map((l) => `IT company ${l} Pune`),
  ...SECTORS.map((s) => `${s} Pune`),
  ...LANDMARKS,
];

const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

async function searchPage(query, pagetoken) {
  const params = new URLSearchParams({ key: apiKey });
  if (pagetoken) {
    params.set("pagetoken", pagetoken);
  } else {
    params.set("query", query);
    params.set("location", PUNE_LOCATION);
    params.set("radius", String(PUNE_RADIUS_M));
  }
  const res = await fetch(`${TEXT_SEARCH_URL}?${params}`);
  if (!res.ok) throw new Error(`Google Places request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function searchAll(query) {
  const results = [];
  let pagetoken;
  do {
    const data = await searchPage(query, pagetoken);
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn(`"${query}": ${data.status} ${data.error_message ?? ""}`);
      break;
    }
    results.push(...(data.results ?? []));
    pagetoken = data.next_page_token;
    // Google requires a short delay before a next_page_token becomes valid.
    if (pagetoken) await new Promise((r) => setTimeout(r, 2000));
  } while (pagetoken);
  return results;
}

const byPlaceId = new Map();
for (const query of QUERIES) {
  console.log(`Searching "${query}"...`);
  const results = await searchAll(query);
  console.log(`  -> ${results.length} results`);
  for (const place of results) {
    if (!place.place_id || byPlaceId.has(place.place_id)) continue;
    byPlaceId.set(place.place_id, {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating ?? null,
      types: place.types ?? [],
      source: "google-places",
    });
  }
}

const companies = [...byPlaceId.values()].sort((a, b) => a.name.localeCompare(b.name));
const outPath = path.join(__dirname, "../src/data/companies.google.json");
fs.writeFileSync(outPath, JSON.stringify(companies, null, 2));
console.log(`\nWrote ${companies.length} unique places to ${path.relative(process.cwd(), outPath)}`);
