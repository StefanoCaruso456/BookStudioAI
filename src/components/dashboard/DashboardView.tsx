"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookPlus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { DashboardImportBanner } from "@/components/dashboard/DashboardImportBanner";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/lib/data/actions";
import type { BookProject } from "@/types/book";

export function DashboardView({ projects }: { projects: BookProject[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteProjectAction(id);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-content px-5 py-10 sm:px-8">
      <DashboardHeader count={projects.length} />

      <DashboardImportBanner />

      {projects.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/50 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
            <BookPlus className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            No books yet
          </h2>
          <p className="mt-2 max-w-sm text-subtle">
            Turn your content into a professionally structured book. Pick a book
            type and answer a few guided questions.
          </p>
          <Link href="/builder" className="mt-6">
            <Button>Start My Book</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
