#!/usr/bin/env node
/**
 * Single entry point for finding Pune tech-office candidates via Google Places.
 *
 * Two phases, both run by default (skip either with --discover-only / --resolve-only):
 *
 *   1. DISCOVER — broad locality/sector/landmark text searches that surface
 *      companies we don't already know about. Results are classified into a
 *      sector by a name-keyword heuristic (best-effort, meant to be corrected
 *      by reviewers, not treated as ground truth).
 *
 *   2. RESOLVE  — looks up each entry in data/sources/requested-companies.json
 *      (a maintainer-curated wishlist of "this company has a Pune office,
 *      find its address") by name, validating the match is actually in Pune
 *      rather than trusting whatever a global brand's top Google result is.
 *
 * Both phases dedupe against src/data/dump.json (already-trusted data) so
 * re-running this never re-suggests something already promoted. Output is
 * written to data/candidates.json — a reviewable inbox, NOT auto-merged into
 * the app's data. Run `npm run promote-candidates` after reviewing it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.error("Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY in your environment or .env.local.");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const RUN_DISCOVER = !args.has("--resolve-only");
const RUN_RESOLVE = !args.has("--discover-only");

const PUNE_LOCATION = "18.5204,73.8567";
const PUNE_RADIUS_M = 20000;
const PUNE_BBOX = { minLng: 73.6, maxLng: 74.1, minLat: 18.35, maxLat: 18.75 };
const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

// Pure geo/address records Google returns for landmark queries — not businesses.
const GEO_ONLY_TYPES = new Set([
  "street_address", "premise", "subpremise", "route",
  "sublocality", "sublocality_level_2", "neighborhood", "political", "locality",
]);

// Best-effort keyword classifier for DISCOVER-phase results (RESOLVE-phase
// entries already carry an explicit category from requested-companies.json).
const CLASSIFY_RULES = [
  { category: "BFSI", pattern: /\b(bank|finance|financial|fincorp|nbfc|insurance|mutual fund|wealth|invest|asset management|broking|securities|payments?|fintech)\b/i },
  { category: "Manufacturing", pattern: /\b(motors?|automotive|forge|foundry|industries|machinery|engines?|pumps?|valves?|bearings?|gears?|casting|fabrication|steel|manufactur\w*)\b/i },
  { category: "Infrastructure & Energy", pattern: /\b(energy|power|solar|renewable|infra\w*|construction|realty|properties|developers?|builders?|cement|epc|biotech)\b/i },
  { category: "Cloud & Cybersecurity", pattern: /\b(security|cyber|antivirus|firewall|network\w*|data\s?center)\b/i },
  { category: "Consulting", pattern: /\b(consulting|consultants?|advisors?|advisory|audit\w*|chartered accountants?|attorneys?|legal|law)\b/i },
  { category: "Startup", pattern: /\b(ventures?|incubator|accelerator|startup|studio|coworking|co-working)\b/i },
  { category: "MNC IT Services", pattern: /\b(outsourcing|bpo|kpo|business services|global services|staffing|recruitment)\b/i },
  { category: "Product / R&D", pattern: /\b(software|technolog\w*|digital|solutions|systems?|infotech|innovation\w*|product\w*|data|analytics|app|platform|computing|games?|gaming|esports)\b/i },
];

function classify(name) {
  for (const { category, pattern } of CLASSIFY_RULES) {
    if (pattern.test(name)) return category;
  }
  return "Product / R&D"; // most permissive fallback for unmatched tech-park entries
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(pvt|ltd|llp|private|limited|technologies|technology|systems|software|solutions|india|inc|corp|the|hq)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isInPune(place) {
  const addr = (place.formatted_address ?? "").toLowerCase();
  if (addr.includes("pune")) return true;
  const { lat, lng } = place.geometry?.location ?? {};
  if (lat == null || lng == null) return false;
  return lat >= PUNE_BBOX.minLat && lat <= PUNE_BBOX.maxLat && lng >= PUNE_BBOX.minLng && lng <= PUNE_BBOX.maxLng;
}

async function textSearch(query, { paginate = false } = {}) {
  const results = [];
  let pagetoken;
  do {
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
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn(`  "${query}": ${data.status} ${data.error_message ?? ""}`);
      break;
    }
    results.push(...(data.results ?? []));
    pagetoken = paginate ? data.next_page_token : undefined;
    if (pagetoken) await new Promise((r) => setTimeout(r, 2000));
  } while (pagetoken);
  return results;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

async function discover(existingIds, existingNames) {
  const localities = readJson("data/sources/localities.json");
  const sectors = readJson("data/sources/sectors.json");
  const landmarks = readJson("data/sources/landmarks.json");
  const queries = [
    "software company",
    "IT company",
    "tech company",
    "software park",
    "IT park",
    "startup office",
    ...localities.map((l) => `IT company ${l} Pune`),
    ...sectors.map((s) => `${s} Pune`),
    ...landmarks,
  ];

  const byPlaceId = new Map();
  for (const query of queries) {
    console.log(`[discover] "${query}"`);
    const results = await textSearch(query, { paginate: true });
    console.log(`  -> ${results.length} results`);
    for (const place of results) {
      if (!place.place_id || byPlaceId.has(place.place_id)) continue;
      byPlaceId.set(place.place_id, place);
    }
  }

  const seenExactNames = new Set();
  const candidates = [];
  for (const place of byPlaceId.values()) {
    if (!place.geometry?.location) continue;
    if (place.formatted_address?.includes("Thailand")) continue; // stray non-Pune match
    if ((place.types ?? []).some((t) => GEO_ONLY_TYPES.has(t))) continue; // address/landmark, not a business
    if (existingIds.has(place.place_id)) continue;
    if (existingNames.has(normalizeName(place.name))) continue;
    const exactKey = place.name.toLowerCase().trim();
    if (seenExactNames.has(exactKey)) continue; // same IT-park name registered many times
    seenExactNames.add(exactKey);

    candidates.push({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      category: classify(place.name),
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      source: "discover",
    });
  }
  return candidates;
}

async function resolve(existingIds, existingNames) {
  const requested = readJson("data/sources/requested-companies.json");
  const candidates = [];
  const notFound = [];

  for (const { name, category } of requested) {
    if (existingNames.has(normalizeName(name))) continue; // already promoted

    const clean = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
    const results = await textSearch(`${clean} Pune office`);
    const place = results.find(isInPune);
    await new Promise((r) => setTimeout(r, 150)); // stay under QPS limits

    if (!place) {
      console.warn(`[resolve] ✗ ${name}: no Pune-verified match`);
      notFound.push(name);
      continue;
    }
    if (existingIds.has(place.place_id)) continue;
    console.log(`[resolve] ✓ ${name} -> ${place.formatted_address}`);
    candidates.push({
      id: place.place_id,
      name,
      address: place.formatted_address,
      category,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      source: "resolve",
    });
  }
  return { candidates, notFound };
}

async function main() {
  const dump = readJson("src/data/dump.json");
  const existingIds = new Set(dump.map((c) => c.id));
  const existingNames = new Set(dump.map((c) => normalizeName(c.name)));

  let discovered = [];
  let resolved = [];
  let notFound = [];

  if (RUN_DISCOVER) discovered = await discover(existingIds, existingNames);
  if (RUN_RESOLVE) ({ candidates: resolved, notFound } = await resolve(existingIds, existingNames));

  // Resolve-phase entries are maintainer-vetted by name, so they win on overlap.
  const byId = new Map();
  for (const c of [...discovered, ...resolved]) byId.set(c.id, c);

  const candidates = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  const outPath = path.join(ROOT, "data/candidates.json");
  fs.writeFileSync(outPath, JSON.stringify(candidates, null, 2) + "\n");

  console.log(`\nWrote ${candidates.length} new candidates to ${path.relative(ROOT, outPath)}`);
  if (notFound.length) {
    console.log(`\nNot found / no Pune match (${notFound.length}) — add a real address manually if you have one:`);
    for (const n of notFound) console.log(`  - ${n}`);
  }
  console.log(`\nReview data/candidates.json, then run: npm run promote-candidates`);
}

main();
