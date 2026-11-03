import { AppShell } from "@/components/AppShell";
import { CompareClient } from "@/components/CompareClient";

export default function ComparePage() {
  return (
    <AppShell title="Compare" subtitle="Pick two tools and contrast them.">
      <CompareClient />
    </AppShell>
  );
}
