import { AppShell } from "@/components/AppShell";
import { HomeCluster } from "@/components/HomeCluster";
import { toolCount } from "@data/tools";

export default function HomePage() {
  return (
    <AppShell
      title="Cluster map"
      subtitle={`${toolCount} tools — tap a pin or card to open its placement diagram and install guide.`}
    >
      <HomeCluster />
    </AppShell>
  );
}
