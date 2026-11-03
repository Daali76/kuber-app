import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, lessons } from "@data/lessons";
import { AppShell } from "@/components/AppShell";
import { LessonClient } from "@/components/LessonClient";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[id]">): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  return { title: lesson?.title.en ?? "Lesson" };
}

export default async function LessonPage({
  params,
}: PageProps<"/learn/[id]">) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return (
    <AppShell>
      <LessonClient lesson={lesson} />
    </AppShell>
  );
}
