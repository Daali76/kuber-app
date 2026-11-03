import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { BuilderClient } from "@/components/BuilderClient";

export const metadata: Metadata = {
  title: "Stack builder",
};

export default function BuilderPage() {
  return (
    <AppShell
      title="Stack builder"
      subtitle="Answer a few prompts — get one recommended tool per layer and an install order."
    >
      <BuilderClient />
    </AppShell>
  );
}
