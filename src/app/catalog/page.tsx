import type { Metadata } from "next";
import { landscapeCatalog } from "@data/landscape";
import { AppShell } from "@/components/AppShell";
import { CatalogClient } from "@/components/CatalogClient";

export const metadata: Metadata = {
  title: "CNCF Catalog",
  description: "Browse CNCF Landscape projects (offline static catalog).",
};

export default function CatalogPage() {
  return (
    <AppShell
      title="CNCF Catalog"
      subtitle="Landscape projects imported for offline browsing. Filter by category, maturity, or search."
    >
      <CatalogClient items={landscapeCatalog.items} />
    </AppShell>
  );
}
