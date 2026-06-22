"use client";
// One-time import (T10): if the visitor has books in localStorage from before
// accounts existed, offer to move them onto their account. Hidden once there's
// nothing local to import.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, useHydrated } from "@/lib/store";
import { importProjectsAction } from "@/lib/data/actions";

export function DashboardImportBanner() {
  const router = useRouter();
  const hydrated = useHydrated();
  const localProjects = useStore((s) => s.projects);
  const clearProjects = useStore((s) => s.clearProjects);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  if (!hydrated || done || localProjects.length === 0) return null;

  async function runImport() {
    setImporting(true);
    try {
      await importProjectsAction(localProjects);
      clearProjects();
      setDone(true);
      router.refresh();
    } finally {
      setImporting(false);
    }
  }

  const n = localProjects.length;
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo/30 bg-indigo-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo/15 text-indigo">
          <Upload className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">
            {n} {n === 1 ? "book" : "books"} saved in this browser
          </p>
          <p className="text-sm text-subtle">
            Import {n === 1 ? "it" : "them"} into your account so they sync
            everywhere.
          </p>
        </div>
      </div>
      <Button onClick={runImport} disabled={importing} className="shrink-0">
        {importing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import to my account
      </Button>
    </div>
  );
}
