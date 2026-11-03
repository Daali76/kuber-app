import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage() {
  return (
    <AppShell
      title="Search & filter"
      subtitle="Find tools by name, layer, or CNCF maturity."
    >
      <SearchClient />
    </AppShell>
  );
}
