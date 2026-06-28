import { MapShell } from "@/components/MapShell";
import { allCompanies } from "@/data/merged";

export default function Home() {
  return (
    <div className="h-dvh overflow-hidden">
      <MapShell companies={allCompanies} />
    </div>
  );
}
