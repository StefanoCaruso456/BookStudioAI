"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChapterSidebar } from "./ChapterSidebar";
import { ChapterEditor } from "./ChapterEditor";
import { AIActionPanel } from "./AIActionPanel";
import { EditingToolbar } from "./EditingToolbar";
import { SubscriptionGate } from "@/components/common/SubscriptionGate";
import { patchChapterAction } from "@/lib/data/actions";
import { useAutosave } from "@/lib/useAutosave";
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

type ChapterPatch = Partial<Pick<Chapter, "title" | "summary" | "content" | "status">>;
/** The pending write payload: the newest patch per touched chapter, merged. */
type SavePayload = Record<string, ChapterPatch>;

export function ChapterWorkspace({
  project,
  isPro,
}: {
  project: BookProject;
  /** Server-resolved Pro entitlement (Phase 5). Drives the upgrade UX; the
   *  real gate lives in the server actions. */
  isPro: boolean;
}) {
  // Chapters live in local state, seeded from the server-loaded project, so
  // edits feel instant; persistence is routed through the debounced,
  // single-flight autosaver (ADR-1/ADR-2) — no more per-keystroke writes.
  const [chapters, setChapters] = useState<Chapter[]>(project.chapters);

  const [selectedId, setSelectedId] = useState("");
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<EditMode | null>(null);
  const [suggestion, setSuggestion] = useState<
    { mode: EditMode; summary: string; content: string } | null
  >(null);
  const [showGate, setShowGate] = useState(false);

  // The autosaver persists a merged map of patches; one server action per
  // touched chapter. Most of the time that's a single chapter being edited.
  const persist = useCallback(
    async (payload: SavePayload) => {
      const entries = Object.entries(payload);
      await Promise.all(
        entries.map(([chapterId, patch]) =>
          patchChapterAction(project.id, chapterId, patch)
        )
      );
    },
    [project.id]
  );

  const saver = useAutosave<SavePayload>(persist);
  const lastSavedAt = saver.lastSavedAt;
  // Accumulates patches between debounce windows so several quick edits to a
  // chapter (or two chapters) coalesce into the smallest set of writes. Cleared
  // once the server confirms a write (lastSavedAt advances) so we never re-send
  // already-persisted fields.
  const queued = useRef<SavePayload>({});

  useEffect(() => {
    if (lastSavedAt && !saver.dirty) queued.current = {};
  }, [lastSavedAt, saver.dirty]);

  // Optimistic local update + queue a debounced write-through.
  const patchChapter = useCallback(
    (chapterId: string, patch: ChapterPatch) => {
      setChapters((cs) =>
        cs.map((c) => (c.id === chapterId ? { ...c, ...patch } : c))
      );
      queued.current = {
        ...queued.current,
        [chapterId]: { ...queued.current[chapterId], ...patch },
      };
      // Hand the saver a fresh snapshot (it holds the reference until the write
      // fires), so we can keep mutating `queued` without disturbing in-flight data.
      saver.schedule({ ...queued.current });
    },
    [saver]
  );

  // Honor ?chapter=<id> (resume deep-link, ADR-4) like the builder's ?type=.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = new URLSearchParams(window.location.search).get("chapter");
    if (target && project.chapters.some((c) => c.id === target)) {
      setSelectedId(target);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unsaved-changes guard (T3): warn while a write is pending or in flight, and
  // best-effort flush on tab-hide so a debounce window in progress isn't lost.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saver.dirty || saver.status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saver.flush();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [saver]);

  const selected = chapters.find((c) => c.id === selectedId) ?? chapters[0];
  const tone = project.blueprint?.tone ?? "Clear and warm";

  // Optimistic client check: skip the round-trip when we already know the user
  // isn't Pro. The authoritative gate is server-side (the action throws
  // UPGRADE_REQUIRED), caught by isUpgradeRequired below.
  function requireSub(): boolean {
    if (!isPro) {
      setShowGate(true);
      return false;
    }
    return true;
  }

  // The server actions throw Error("UPGRADE_REQUIRED") for non-Pro users; in
  // production Server Action errors are redacted, so also match the digest-safe
  // message. Either way, surface the gate.
  function isUpgradeRequired(err: unknown): boolean {
    return err instanceof Error && err.message.includes("UPGRADE_REQUIRED");
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
    } catch (err) {
      if (isUpgradeRequired(err)) setShowGate(true);
      else throw err;
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
    } catch (err) {
      if (isUpgradeRequired(err)) setShowGate(true);
      else throw err;
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
    } catch (err) {
      if (isUpgradeRequired(err)) setShowGate(true);
      else throw err;
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
              saveStatus={saver.status}
              lastSavedAt={saver.lastSavedAt}
              onRetry={saver.retry}
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
