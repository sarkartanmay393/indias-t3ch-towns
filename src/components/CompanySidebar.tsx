"use client";

import { useMemo, useState } from "react";
import type { Company } from "@/data/companies";
import { companyIconSvg, CATEGORY_COLOR } from "@/components/companyIcons";

const SIDEBAR_WIDTH = 320;

export function CompanySidebar({
  companies,
  selectedId,
  onSelect,
  open,
  onToggle,
}: {
  companies: Company[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      )
      .sort((a, b) => Number(b.name.toLowerCase().includes(q)) - Number(a.name.toLowerCase().includes(q)));
  }, [companies, query]);

  const missingCount = useMemo(() => companies.filter((c) => c.lng == null).length, [companies]);

  return (
    <>
      {open && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-20 bg-ink/40 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex h-full min-h-0 flex-col overflow-hidden border-r border-hairline bg-paper shadow-lg transition-[width] duration-200 md:static md:z-auto md:shadow-none"
        style={{ width: open ? SIDEBAR_WIDTH : 0 }}
      >
        <div className="flex-shrink-0 border-b border-hairline px-4 pb-3 pt-4">
          <h1 className="font-serif text-lg font-semibold text-ink">
            TechCities <span className="font-sans text-sm font-normal text-ink-muted">· Pune</span>
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">{companies.length} offices plotted</p>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies..."
            className="mt-3 w-full rounded-md border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-clay"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            {filtered.length} of {companies.length} companies
          </p>
          {missingCount > 0 && (
            <p className="mt-1.5 text-xs text-clay">
              {missingCount} pending geocoding —{" "}
              <code className="font-mono">npm run geocode</code>
            </p>
          )}
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {filtered.map((company) => {
            const isSelected = company.id === selectedId;
            const isPlottable = company.lng != null && company.lat != null;
            return (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => isPlottable && onSelect(company.id)}
                  disabled={!isPlottable}
                  className={`flex w-full items-start gap-2.5 border-b border-hairline border-l-2 px-3.5 py-2.5 text-left transition-colors ${
                    isSelected ? "border-l-clay bg-clay-soft" : "border-l-transparent hover:bg-canvas"
                  } ${!isPlottable ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: CATEGORY_COLOR[company.category] }}
                    dangerouslySetInnerHTML={{ __html: companyIconSvg(company.category, 13) }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{company.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{company.address}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute top-3 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-paper text-ink shadow transition-[left] duration-200 hover:bg-clay-soft hover:text-clay"
        style={{ left: open ? SIDEBAR_WIDTH + 12 : 12 }}
      >
        {open ? "‹" : "›"}
      </button>
    </>
  );
}
