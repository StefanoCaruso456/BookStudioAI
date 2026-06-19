"use client";
// ===========================================================================
// Client-side store (Zustand + localStorage).
//
// This is the MVP "source of truth". It implements the exact same shapes the
// Drizzle schema describes (see src/lib/db/schema.ts), so swapping this for
// real Postgres + server actions later is a drop-in: replace these actions
// with API calls and keep the component contracts identical.
// ===========================================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import { uid, nowIso } from "@/lib/utils";
import type {
  BookProject,
  BookType,
  BookGoal,
  Audience,
  SourceContent,
  BookBlueprint,
  Chapter,
  PublishingKit,
  SubscriptionPlan,
} from "@/types/book";

export interface BuilderDraft {
  bookType: BookType;
  initialPrompt: string;
  goal?: BookGoal;
  audience: Audience;
  genreData: Record<string, string>;
  sourceContent: SourceContent[];
}

function emptyDraft(bookType: BookType = "cookbook"): BuilderDraft {
  return {
    bookType,
    initialPrompt: "",
    goal: undefined,
    audience: { description: "" },
    genreData: {},
    sourceContent: [],
  };
}

interface StoreState {
  userId: string;
  plan: SubscriptionPlan;
  projects: BookProject[];
  draft: BuilderDraft;

  // subscription gate (placeholder)
  setPlan: (plan: SubscriptionPlan) => void;

  // builder draft
  setDraft: (patch: Partial<BuilderDraft>) => void;
  resetDraft: (bookType?: BookType) => void;
  addSource: (s: Omit<SourceContent, "id" | "projectId" | "createdAt">) => void;
  removeSource: (id: string) => void;

  // projects
  createProject: (blueprint: Omit<BookBlueprint, "id" | "projectId" | "createdAt" | "updatedAt" | "approved">) => BookProject;
  getProject: (id: string) => BookProject | undefined;
  patchProject: (id: string, patch: Partial<BookProject>) => void;
  removeProject: (id: string) => void;
  updateBlueprint: (projectId: string, patch: Partial<BookBlueprint>) => void;
  approveBlueprint: (projectId: string) => void;
  patchChapter: (projectId: string, chapterId: string, patch: Partial<Chapter>) => void;
  setPublishingKit: (projectId: string, kit: Omit<PublishingKit, "id" | "projectId" | "createdAt" | "updatedAt">) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userId: uid("user"),
      plan: "free",
      projects: [],
      draft: emptyDraft(),

      setPlan: (plan) => set({ plan }),

      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      resetDraft: (bookType) => set({ draft: emptyDraft(bookType) }),
      addSource: (s) =>
        set((st) => ({
          draft: {
            ...st.draft,
            sourceContent: [
              ...st.draft.sourceContent,
              { ...s, id: uid("src"), projectId: "draft", createdAt: nowIso() },
            ],
          },
        })),
      removeSource: (id) =>
        set((st) => ({
          draft: {
            ...st.draft,
            sourceContent: st.draft.sourceContent.filter((x) => x.id !== id),
          },
        })),

      createProject: (blueprintInput) => {
        const draft = get().draft;
        const id = uid("proj");
        const ts = nowIso();
        const blueprint: BookBlueprint = {
          ...blueprintInput,
          id: uid("bp"),
          projectId: id,
          approved: false,
          createdAt: ts,
          updatedAt: ts,
        };
        const project: BookProject = {
          id,
          userId: get().userId,
          title: blueprintInput.titleOptions[0] ?? "Untitled Book",
          bookType: draft.bookType,
          goal: draft.goal,
          audience: draft.audience,
          initialPrompt: draft.initialPrompt,
          status: "blueprint",
          genreData: draft.genreData,
          sourceContent: draft.sourceContent.map((s) => ({ ...s, projectId: id })),
          blueprint,
          chapters: [],
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      patchProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p
          ),
        })),

      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      updateBlueprint: (projectId, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId && p.blueprint
              ? { ...p, blueprint: { ...p.blueprint, ...patch, updatedAt: nowIso() }, updatedAt: nowIso() }
              : p
          ),
        })),

      approveBlueprint: (projectId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId || !p.blueprint) return p;
            const ts = nowIso();
            const chapters: Chapter[] = p.blueprint.chapterSummaries.map((c, i) => ({
              id: uid("ch"),
              projectId,
              title: c.title,
              summary: c.summary,
              content: "",
              orderIndex: i,
              status: "not_started",
              createdAt: ts,
              updatedAt: ts,
            }));
            return {
              ...p,
              status: "writing",
              blueprint: { ...p.blueprint, approved: true, updatedAt: ts },
              chapters,
              updatedAt: ts,
            };
          }),
        })),

      patchChapter: (projectId, chapterId, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  updatedAt: nowIso(),
                  chapters: p.chapters.map((c) =>
                    c.id === chapterId ? { ...c, ...patch, updatedAt: nowIso() } : c
                  ),
                }
              : p
          ),
        })),

      setPublishingKit: (projectId, kitInput) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            const ts = nowIso();
            const kit: PublishingKit = {
              ...kitInput,
              id: p.publishingKit?.id ?? uid("kit"),
              projectId,
              createdAt: p.publishingKit?.createdAt ?? ts,
              updatedAt: ts,
            };
            return { ...p, publishingKit: kit, status: "publishing", updatedAt: ts };
          }),
        })),
    }),
    {
      name: "book-studio-ai",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        userId: s.userId,
        plan: s.plan,
        projects: s.projects,
        draft: s.draft,
      }),
    }
  )
);

/** Avoids hydration mismatches: returns true only after the client has mounted. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
