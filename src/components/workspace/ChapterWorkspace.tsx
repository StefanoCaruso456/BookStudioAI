"use client";
import { useRef, useState } from "react";
import { ChapterSidebar } from "./ChapterSidebar";
import { ChapterEditor } from "./ChapterEditor";
import { AIActionPanel } from "./AIActionPanel";
import { EditingToolbar } from "./EditingToolbar";
import { SubscriptionGate } from "@/components/common/SubscriptionGate";
import { useStore } from "@/lib/store";
import { patchChapterAction } from "@/lib/data/actions";
import {
  generateChapterDraft,
  rewriteChapter,
  editChapter,
  type ChapterAction,
  type EditMode,
} from "@/lib/ai";
import type { BookProject, Chapter, ChapterStatus } from "@/types/book";

const ACTION_LABELS: Record<ChapterAction, string> = {
  rewrite: "Rewrite",
  make_more_personal: "More personal",
  make_more_professional: "More professional",
  add_examples: "Add examples",
  add_story: "Add story",
  add_action_steps: "Add action steps",
  add_genre_content: "Add genre content",
};

export function ChapterWorkspace({ project }: { project: BookProject }) {
  // Chapters live in local state, seeded from the server-loaded project, so
  // edits feel instant; each change is written through to Postgres via the
  // patchChapter server action.
  const [chapters, setChapters] = useState<Chapter[]>(project.chapters);
  const plan = useStore((s) => s.plan);

  const [selectedId, setSelectedId] = useState("");
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<EditMode | null>(null);
  const [suggestion, setSuggestion] = useState<
    { mode: EditMode; summary: string; content: string } | null
  >(null);
  const [showGate, setShowGate] = useState(false);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = chapters.find((c) => c.id === selectedId) ?? chapters[0];
  const tone = project.blueprint?.tone ?? "Clear and warm";

  function markSaved() {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), 500);
  }

  // Optimistic local update + write-through to the DB.
  function patchChapter(
    chapterId: string,
    patch: Partial<Pick<Chapter, "title" | "summary" | "content" | "status">>
  ) {
    setChapters((cs) =>
      cs.map((c) => (c.id === chapterId ? { ...c, ...patch } : c))
    );
    void patchChapterAction(project.id, chapterId, patch);
    markSaved();
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
    patchChapter(selected.id, { content, status });
  }

  async function generateDraft() {
    if (!selected || !requireSub()) return;
    setBusyLabel("Generating draft");
    try {
      const text = await generateChapterDraft({
        chapterTitle: selected.title,
        chapterSummary: selected.summary,
        bookType: project.bookType,
        tone,
        audience: project.audience ?? { description: "your readers" },
        genreData: project.genreData,
        sourceContent: project.sourceContent,
      });
      patchChapter(selected.id, { content: text, status: "drafting" });
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
        bookType: project.bookType,
      });
      patchChapter(selected.id, { content: text });
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
    patchChapter(selected.id, {
      content: suggestion.content,
      status: "needs_review",
    });
    setSuggestion(null);
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
              onChangeTitle={(v) => patchChapter(selected.id, { title: v })}
              onChangeContent={updateContent}
              onChangeStatus={(s) => patchChapter(selected.id, { status: s })}
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
            suggestion={
              suggestion
                ? { mode: suggestion.mode, summary: suggestion.summary }
                : null
            }
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
