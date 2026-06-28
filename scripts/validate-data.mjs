#!/usr/bin/env node
/**
 * Lints src/data/dump.json — the single file the webapp reads — so
 * crowdsourced edits (hand PRs or promote-candidates output) stay correct.
 * Exits non-zero on any error so it can run in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const dumpPath = path.join(ROOT, "src/data/dump.json");

// Kept in sync with src/data/companies.ts Category union.
const VALID_CATEGORIES = new Set([
  "MNC IT Services",
  "Product / R&D",
  "Startup",
  "Cloud & Cybersecurity",
  "BFSI",
  "Consulting",
  "Manufacturing",
  "Infrastructure & Energy",
]);

// Generous Pune bounding box — same one the fetch pipeline validates against.
const PUNE_BBOX = { minLng: 73.6, maxLng: 74.1, minLat: 18.35, maxLat: 18.75 };

const REQUIRED_STRING_FIELDS = ["id", "name", "address", "category"];

let raw;
try {
  raw = fs.readFileSync(dumpPath, "utf8");
} catch (err) {
  console.error(`Cannot read ${dumpPath}: ${err.message}`);
  process.exit(1);
}

let dump;
try {
  dump = JSON.parse(raw);
} catch (err) {
  console.error(`src/data/dump.json is not valid JSON: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(dump)) {
  console.error("src/data/dump.json must be a JSON array.");
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenIds = new Map();

dump.forEach((entry, i) => {
  const where = `entry ${i} (${entry?.id ?? entry?.name ?? "unknown"})`;

  if (typeof entry !== "object" || entry === null) {
    errors.push(`${where}: not an object`);
    return;
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      errors.push(`${where}: missing or empty "${field}"`);
    }
  }

  if (typeof entry.id === "string") {
    if (seenIds.has(entry.id)) {
      errors.push(`${where}: duplicate id, also used by entry ${seenIds.get(entry.id)}`);
    } else {
      seenIds.set(entry.id, i);
    }
  }

  if (typeof entry.category === "string" && !VALID_CATEGORIES.has(entry.category)) {
    errors.push(`${where}: invalid category "${entry.category}" (expected one of ${[...VALID_CATEGORIES].join(", ")})`);
  }

  if (typeof entry.lat !== "number" || typeof entry.lng !== "number") {
    errors.push(`${where}: missing numeric lat/lng`);
  } else {
    if (entry.lat < PUNE_BBOX.minLat || entry.lat > PUNE_BBOX.maxLat || entry.lng < PUNE_BBOX.minLng || entry.lng > PUNE_BBOX.maxLng) {
      errors.push(`${where}: lat/lng (${entry.lat}, ${entry.lng}) falls outside Pune's bounding box`);
    }
  }

  const extraKeys = Object.keys(entry).filter((k) => !["id", "name", "address", "category", "lat", "lng"].includes(k));
  if (extraKeys.length) {
    warnings.push(`${where}: unexpected field(s) ${extraKeys.join(", ")}`);
  }
});

// Near-duplicate name detection (same normalized name, different id) — likely
// the same office entered twice, worth a human glance but not a hard error.
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(pvt|ltd|llp|private|limited|technologies|technology|systems|software|solutions|india|inc|corp|the|hq)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}
const byNormalizedName = new Map();
dump.forEach((entry, i) => {
  if (typeof entry?.name !== "string") return;
  const key = normalizeName(entry.name);
  if (!key) return;
  if (byNormalizedName.has(key)) {
    warnings.push(`entry ${i} ("${entry.name}") has a name similar to entry ${byNormalizedName.get(key)} — possible duplicate`);
  } else {
    byNormalizedName.set(key, i);
  }
});

console.log(`Checked ${dump.length} entries in src/data/dump.json.`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  process.exit(1);
}

console.log("\nAll good.");
