import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, tools } from "@data/tools";
import { AppShell } from "@/components/AppShell";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export async function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tools/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.name,
    description: tool.summary,
  };
}

export default async function ToolDetailPage({
  params,
}: PageProps<"/tools/[id]">) {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) notFound();

  return (
    <AppShell>
      <ToolWorkspace tool={tool} />
    </AppShell>
  );
}
