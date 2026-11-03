import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { StrategiesHubClient } from "@/components/StrategiesHubClient";

export const metadata: Metadata = {
  title: "Strategies & GitOps",
  description:
    "Deployment strategies and GitOps patterns with cluster diagrams and labs.",
};

export default function StrategiesPage() {
  return (
    <AppShell>
      <StrategiesHubClient />
    </AppShell>
  );
}
