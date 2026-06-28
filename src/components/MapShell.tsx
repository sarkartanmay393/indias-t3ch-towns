"use client";

import { useEffect, useState } from "react";
import { PuneMap } from "@/components/PuneMap";
import { CompanySidebar } from "@/components/CompanySidebar";
import type { Company } from "@/data/companies";

export function MapShell({ companies }: { companies: Company[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Default to a closed (overlay) sidebar on small screens so the map isn't
  // squeezed into a sliver on first load.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="relative flex h-full overflow-hidden bg-canvas">
      <CompanySidebar
        companies={companies}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          if (window.matchMedia("(max-width: 767px)").matches) {
            setSidebarOpen(false);
          }
        }}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <div className="relative min-h-0 flex-1">
        <PuneMap companies={companies} selectedId={selectedId} />
      </div>
    </div>
  );
}
