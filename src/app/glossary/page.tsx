import { AppShell } from "@/components/AppShell";
import { GlossaryClient } from "@/components/GlossaryClient";

export default function GlossaryPage() {
  return (
    <AppShell title="Glossary" subtitle="Tap a term for a short definition.">
      <GlossaryClient />
    </AppShell>
  );
}
