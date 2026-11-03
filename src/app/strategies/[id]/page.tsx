import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStrategy, strategies } from "@data/strategies";
import { AppShell } from "@/components/AppShell";
import { StrategyWorkspace } from "@/components/StrategyWorkspace";

export function generateStaticParams() {
  return strategies.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/strategies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const strategy = getStrategy(id);
  if (!strategy) return { title: "Strategy" };
  return {
    title: strategy.name.en,
    description: strategy.summary.en,
  };
}

export default async function StrategyDetailPage({
  params,
}: PageProps<"/strategies/[id]">) {
  const { id } = await params;
  const strategy = getStrategy(id);
  if (!strategy) notFound();

  return (
    <AppShell>
      <StrategyWorkspace strategy={strategy} />
    </AppShell>
  );
}
