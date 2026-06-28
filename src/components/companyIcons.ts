import type { Company } from "@/data/companies";

const ICON_BODY: Record<Company["category"], string> = {
  // building
  "MNC IT Services": `<path d="M4 21V7a1 1 0 0 1 1-1h6V3.5a1 1 0 0 1 1.4-.9l6 2.9a1 1 0 0 1 .6.9V21"/><path d="M4 21h16"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/>`,
  // chip
  "Product / R&D": `<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>`,
  // rocket
  Startup: `<path d="M12 2.5c2.2 1.8 4 5.6 4 9.3 0 2-1 4.2-2 5.3l-2-2.1-2 2.1c-1-1.1-2-3.3-2-5.3 0-3.7 1.8-7.5 4-9.3Z"/><path d="M9.3 16.8 7 21l4.2-2M14.7 16.8 17 21l-4.2-2"/>`,
  // shield
  "Cloud & Cybersecurity": `<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/>`,
  // landmark / bank
  BFSI: `<polygon points="12 2 21 8 3 8"/><line x1="5" y1="8" x2="5" y2="19"/><line x1="10" y1="8" x2="10" y2="19"/><line x1="14" y1="8" x2="14" y2="19"/><line x1="19" y1="8" x2="19" y2="19"/><line x1="3" y1="21" x2="21" y2="21"/>`,
  // briefcase
  Consulting: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  // factory
  Manufacturing: `<path d="M3 21V10l5 4V10l5 4V8l6 4v9H3Z"/><line x1="3" y1="21" x2="21" y2="21"/>`,
  // bolt
  "Infrastructure & Energy": `<path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z"/>`,
};

export function companyIconSvg(category: Company["category"], size = 16): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}">${ICON_BODY[category]}</svg>`;
}

// Muted, warm-neutral family — distinct hues kept legible across hundreds of map
// points, desaturated so no single category visually dominates the map.
export const CATEGORY_COLOR: Record<Company["category"], string> = {
  "MNC IT Services": "#3B5166", // slate blue
  "Product / R&D": "#4F6B47", // forest sage
  Startup: "#8A5A2A", // warm umber
  "Cloud & Cybersecurity": "#2F6B6B", // teal
  BFSI: "#7A3B42", // wine/maroon
  Consulting: "#4A4A72", // indigo-slate
  Manufacturing: "#6B4226", // rust brown
  "Infrastructure & Energy": "#7A6B2E", // olive amber
};
