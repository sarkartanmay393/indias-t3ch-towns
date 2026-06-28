import { companies as baseCompanies, type Company } from "@/data/companies";
import geocoded from "@/data/companies.geocoded.json";
import googlePlaces from "@/data/companies.google.json";
import namedPlaces from "@/data/companies.named.json";

type ResolvedPlace = {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  category?: Company["category"];
  source: string;
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // drop disambiguating parentheticals, e.g. "(an EXL Company)"
    .replace(/\b(pvt|ltd|llp|private|limited|technologies|technology|systems|software|solutions|india|inc|corp|the|hq)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const geocodedById = new Map((geocoded as Company[]).map((c) => [c.id, c]));
const curated: Company[] = baseCompanies.map((c) => ({
  ...c,
  ...geocodedById.get(c.id),
}));

const curatedNames = new Set(curated.map((c) => normalizeName(c.name)));

const namedIdCounts = new Map<string, number>();
const named: Company[] = (namedPlaces as ResolvedPlace[])
  .filter((p) => p.lat != null && p.lng != null)
  .filter((p) => !curatedNames.has(normalizeName(p.name)))
  .map((p) => {
    // Distinct companies can share one Google listing (e.g. Bajaj Finserv and
    // Bajaj Finance in the same building) — keep both, just make the id unique.
    const seen = namedIdCounts.get(p.id) ?? 0;
    namedIdCounts.set(p.id, seen + 1);
    return {
      id: seen === 0 ? p.id : `${p.id}-${seen}`,
      name: p.name,
      address: p.address,
      category: p.category ?? "Discovered",
      lat: p.lat,
      lng: p.lng,
    };
  });

const namedAndCuratedNames = new Set([...curatedNames, ...named.map((c) => normalizeName(c.name))]);
// google.json and companies.named.json both key off real Google place_ids — the
// same physical place can get captured by both scripts under slightly different
// name strings (e.g. "EXL Service Hadapsar" vs "EXL Service"), which the
// name-based dedupe above won't always catch. Guard on the id directly too.
const namedIds = new Set(named.map((c) => c.id));

const seenExactNames = new Set<string>();
const discovered: Company[] = (googlePlaces as ResolvedPlace[])
  .filter((p) => p.lat != null && p.lng != null)
  .filter((p) => !p.address.includes("Thailand")) // stray non-Pune result from a generic query
  .filter((p) => !namedIds.has(p.id)) // same Google place already captured by the named list
  .filter((p) => !namedAndCuratedNames.has(normalizeName(p.name))) // drop dupes already curated/named
  .filter((p) => {
    // Large IT parks (Giga Space, Panchshil Business Park, etc.) surface as
    // many separately-registered units sharing the exact same generic name —
    // collapse those to one marker rather than stacking identical labels.
    const key = p.name.toLowerCase().trim();
    if (seenExactNames.has(key)) return false;
    seenExactNames.add(key);
    return true;
  })
  .map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    category: "Discovered" as const,
    lat: p.lat,
    lng: p.lng,
  }));

export const allCompanies: Company[] = [...curated, ...named, ...discovered];
