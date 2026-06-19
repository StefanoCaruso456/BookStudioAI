"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ChapterSidebar } from "./ChapterSidebar";
import { ChapterEditor } from "./ChapterEditor";
import { AIActionPanel } from "./AIActionPanel";
import { EditingToolbar } from "./EditingToolbar";
import { SubscriptionGate } from "@/components/common/SubscriptionGate";
import { Button } from "@/components/ui/button";
import { useStore, useHydrated } from "@/lib/store";
import {
  generateChapterDraft,
  rewriteChapter,
  editChapter,
  type ChapterAction,
  type EditMode,
} from "@/lib/ai";
import type { ChapterStatus } from "@/types/book";

const ACTION_LABELS: Record<ChapterAction, string> = {
  rewrite: "Rewrite",
  make_more_personal: "More personal",
  make_more_professional: "More professional",
  add_examples: "Add examples",
  add_story: "Add story",
  add_action_steps: "Add action steps",
  add_genre_content: "Add genre content",
};

export function ChapterWorkspace({ projectId }: { projectId: string }) {
  const hydrated = useHydrated();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const plan = useStore((s) => s.plan);
  const patchChapter = useStore((s) => s.patchChapter);

  const [selectedId, setSelectedId] = useState("");
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<EditMode | null>(null);
  const [suggestion, setSuggestion] = useState<
    { mode: EditMode; summary: string; content: string } | null
  >(null);
  const [showGate, setShowGate] = useState(false);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-subtle">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">Project not found</p>
        <p className="max-w-sm text-sm text-subtle">
          This book may have been created on another device. Your projects are
          stored in this browser.
        </p>
        <Link href="/dashboard">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const chapters = project.chapters;
  const selected = chapters.find((c) => c.id === selectedId) ?? chapters[0];
  const tone = project.blueprint?.tone ?? "Clear and warm";

  function markSaved() {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), 500);
  }

  function requireSub(): boolean {
    if (plan === "free") {
      setShowGate(true);
      return false;
    }
    return true;
  }

  function updateContent(content: string) {
    if (!selected) return;
    const status: ChapterStatus =
      selected.status === "not_started" && content.trim()
        ? "drafting"
        : selected.status;
    patchChapter(project!.id, selected.id, { content, status });
    markSaved();
  }

  async function generateDraft() {
    if (!selected || !requireSub()) return;
    setBusyLabel("Generating draft");
    try {
      const text = await generateChapterDraft({
        chapterTitle: selected.title,
        chapterSummary: selected.summary,
        bookType: project!.bookType,
        tone,
        audience: project!.audience ?? { description: "your readers" },
        genreData: project!.genreData,
        sourceContent: project!.sourceContent,
      });
      patchChapter(project!.id, selected.id, { content: text, status: "drafting" });
      markSaved();
    } finally {
      setBusyLabel(null);
    }
  }

  async function runAction(action: ChapterAction) {
    if (!selected || !requireSub()) return;
    setBusyLabel(ACTION_LABELS[action]);
    try {
      const text = await rewriteChapter({
        action,
        content: selected.content,
        chapterTitle: selected.title,
        bookType: project!.bookType,
      });
      patchChapter(project!.id, selected.id, { content: text });
      markSaved();
    } finally {
      setBusyLabel(null);
    }
  }

  async function runEdit(mode: EditMode) {
    if (!selected || !requireSub()) return;
    setBusyMode(mode);
    try {
      const res = await editChapter({ mode, content: selected.content, tone });
      setSuggestion({ mode, summary: res.summary, content: res.content });
    } finally {
      setBusyMode(null);
    }
  }

  function applyEdit() {
    if (!selected || !suggestion) return;
    patchChapter(project!.id, selected.id, {
      content: suggestion.content,
      status: "needs_review",
    });
    setSuggestion(null);
    markSaved();
  }

  const index = chapters.findIndex((c) => c.id === selected?.id);

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      <ChapterSidebar
        projectId={project.id}
        bookTitle={project.title}
        chapters={chapters}
        selectedId={selected?.id ?? ""}
        onSelect={(id) => {
          setSelectedId(id);
          setSuggestion(null);
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col lg:h-screen lg:overflow-y-auto">
        <div className="flex-1 p-5 sm:p-8">
          {selected ? (
            <ChapterEditor
              chapter={selected}
              index={index}
              total={chapters.length}
              saved={saved}
              onChangeTitle={(v) =>
                (patchChapter(project.id, selected.id, { title: v }), markSaved())
              }
              onChangeContent={updateContent}
              onChangeStatus={(s) =>
                (patchChapter(project.id, selected.id, { status: s }), markSaved())
              }
            />
          ) : (
            <p className="text-subtle">This book has no chapters yet.</p>
          )}
        </div>
      </main>

      <div className="border-t border-line bg-canvas/40 p-4 lg:h-screen lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
        <div className="space-y-4">
          <AIActionPanel
            bookType={project.bookType}
            hasContent={!!selected?.content.trim()}
            busyLabel={busyLabel}
            onGenerate={generateDraft}
            onAction={runAction}
          />
          <EditingToolbar
            busyMode={busyMode}
            suggestion={suggestion ? { mode: suggestion.mode, summary: suggestion.summary } : null}
            onEdit={runEdit}
            onApply={applyEdit}
            onDismiss={() => setSuggestion(null)}
          />
        </div>
      </div>

      {showGate && <SubscriptionGate onClose={() => setShowGate(false)} />}
    </div>
  );
}
