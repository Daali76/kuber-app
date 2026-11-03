import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { RoadmapClient } from "@/components/RoadmapClient";

export const metadata: Metadata = {
  title: "Learning roadmap",
};

export default function RoadmapPage() {
  return (
    <AppShell
      title="Learning roadmap"
      subtitle="Beginner → expert. Check off steps — progress stays on this device."
    >
      <RoadmapClient />
    </AppShell>
  );
}
