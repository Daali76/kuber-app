import { AppShell } from "@/components/AppShell";
import { ReviewClient } from "@/components/ReviewClient";

export default function ReviewPage() {
  return (
    <AppShell title="Flashcards" subtitle="Again / Good / Easy spaced repetition.">
      <ReviewClient />
    </AppShell>
  );
}
