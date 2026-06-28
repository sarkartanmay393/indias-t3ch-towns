#!/usr/bin/env node
/**
 * Copies reviewed entries from data/candidates.json into src/data/dump.json —
 * the single file the webapp actually reads. Only adds entries that aren't
 * already present (by Google place id or normalized name), so this is safe
 * to run repeatedly and never overwrites/duplicates existing crowdsourced data.
 *
 * Workflow: npm run fetch-companies  ->  review/edit data/candidates.json
 *           ->  npm run promote-candidates
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(pvt|ltd|llp|private|limited|technologies|technology|systems|software|solutions|india|inc|corp|the|hq)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const dumpPath = path.join(ROOT, "src/data/dump.json");
const candidatesPath = path.join(ROOT, "data/candidates.json");

const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
const candidates = fs.existsSync(candidatesPath) ? JSON.parse(fs.readFileSync(candidatesPath, "utf8")) : [];

if (candidates.length === 0) {
  console.log("data/candidates.json is empty — nothing to promote.");
  process.exit(0);
}

const existingIds = new Set(dump.map((c) => c.id));
const existingNames = new Set(dump.map((c) => normalizeName(c.name)));

let added = 0;
let skipped = 0;
const remaining = [];

for (const c of candidates) {
  if (existingIds.has(c.id) || existingNames.has(normalizeName(c.name))) {
    skipped++;
    continue;
  }
  dump.push({
    id: c.id,
    name: c.name,
    address: c.address,
    category: c.category,
    lat: c.lat,
    lng: c.lng,
  });
  existingIds.add(c.id);
  existingNames.add(normalizeName(c.name));
  added++;
}

fs.writeFileSync(dumpPath, JSON.stringify(dump, null, 2) + "\n");
fs.writeFileSync(candidatesPath, JSON.stringify(remaining, null, 2) + "\n"); // drain the inbox

console.log(`Promoted ${added} new compan${added === 1 ? "y" : "ies"} into src/data/dump.json.`);
if (skipped) console.log(`Skipped ${skipped} already present.`);
console.log(`src/data/dump.json now has ${dump.length} entries.`);
