import dump from "@/data/dump.json";
import type { Company } from "@/data/companies";

// dump.json is the single source of truth for company data. Edit it directly
// for corrections/additions, or grow it via the data pipeline — see data/README.md.
export const allCompanies = dump as Company[];
