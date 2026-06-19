import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";
import type { BlueprintDraft } from "./ai/types";

// The store is a module-level singleton. Reset the mutable slices before each
// test so cases don't bleed into one another.
function resetStore() {
  useStore.setState({
    plan: "free",
    projects: [],
    draft: {
      bookType: "cookbook",
      initialPrompt: "",
      goal: undefined,
      audience: { description: "" },
      genreData: {},
      sourceContent: [],
    },
  });
}

const blueprintDraft = (over: Partial<BlueprintDraft> = {}): BlueprintDraft => ({
  titleOptions: ["My Great Book", "The Handbook"],
  subtitleOptions: ["A guide"],
  bookPromise: "You'll learn a lot.",
  targetReader: "readers",
  tone: "Warm",
  tableOfContents: ["Intro", "Middle", "End"],
  chapterSummaries: [
    { title: "Intro", summary: "The beginning." },
    { title: "Middle", summary: "The core." },
    { title: "End", summary: "The wrap-up." },
  ],
  estimatedLength: "120 pages",
  nextSteps: ["Approve"],
  ...over,
});

beforeEach(resetStore);

describe("draft actions", () => {
  it("patches the draft without clobbering other fields", () => {
    useStore.getState().setDraft({ initialPrompt: "a book about bread" });
    useStore.getState().setDraft({ goal: "teach_skill" });
    const { draft } = useStore.getState();
    expect(draft.initialPrompt).toBe("a book about bread");
    expect(draft.goal).toBe("teach_skill");
  });

  it("resets the draft, optionally to a given book type", () => {
    useStore.getState().setDraft({ initialPrompt: "stale" });
    useStore.getState().resetDraft("travel_guide");
    const { draft } = useStore.getState();
    expect(draft.initialPrompt).toBe("");
    expect(draft.bookType).toBe("travel_guide");
  });

  it("adds a source with generated id and 'draft' projectId", () => {
    useStore.getState().addSource({ type: "note", title: "Idea", content: "..." });
    const [src] = useStore.getState().draft.sourceContent;
    expect(src.id).toMatch(/^src_/);
    expect(src.projectId).toBe("draft");
    expect(src.createdAt).not.toBe("");
  });

  it("removes a source by id without touching others", () => {
    const add = useStore.getState().addSource;
    add({ type: "note", title: "A", content: "" });
    add({ type: "note", title: "B", content: "" });
    const [first] = useStore.getState().draft.sourceContent;
    useStore.getState().removeSource(first.id);
    const titles = useStore.getState().draft.sourceContent.map((s) => s.title);
    expect(titles).toEqual(["B"]);
  });
});

describe("createProject", () => {
  it("derives the title from the first title option", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    expect(project.title).toBe("My Great Book");
    expect(project.status).toBe("blueprint");
  });

  it("falls back to 'Untitled Book' when there are no title options", () => {
    const project = useStore.getState().createProject(blueprintDraft({ titleOptions: [] }));
    expect(project.title).toBe("Untitled Book");
  });

  it("prepends the new project and links source content to its id", () => {
    useStore.getState().addSource({ type: "note", title: "Note", content: "" });
    const project = useStore.getState().createProject(blueprintDraft());
    const stored = useStore.getState().projects;
    expect(stored[0].id).toBe(project.id);
    expect(project.sourceContent[0].projectId).toBe(project.id);
    expect(project.blueprint?.projectId).toBe(project.id);
    expect(project.blueprint?.approved).toBe(false);
  });
});

describe("approveBlueprint", () => {
  it("expands chapter summaries into ordered chapters and flips status", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    useStore.getState().approveBlueprint(project.id);
    const updated = useStore.getState().getProject(project.id)!;
    expect(updated.status).toBe("writing");
    expect(updated.blueprint?.approved).toBe(true);
    expect(updated.chapters).toHaveLength(3);
    expect(updated.chapters.map((c) => c.orderIndex)).toEqual([0, 1, 2]);
    expect(updated.chapters.map((c) => c.title)).toEqual(["Intro", "Middle", "End"]);
    expect(updated.chapters.every((c) => c.status === "not_started")).toBe(true);
  });
});

describe("patchChapter", () => {
  it("updates only the targeted chapter", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    useStore.getState().approveBlueprint(project.id);
    const target = useStore.getState().getProject(project.id)!.chapters[1];
    useStore.getState().patchChapter(project.id, target.id, {
      content: "Drafted body",
      status: "complete",
    });
    const chapters = useStore.getState().getProject(project.id)!.chapters;
    expect(chapters[1].content).toBe("Drafted body");
    expect(chapters[1].status).toBe("complete");
    expect(chapters[0].content).toBe("");
  });
});

describe("updateBlueprint", () => {
  it("merges patch into the blueprint", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    useStore.getState().updateBlueprint(project.id, { tone: "Bold" });
    expect(useStore.getState().getProject(project.id)!.blueprint?.tone).toBe("Bold");
  });
});

describe("setPublishingKit", () => {
  it("attaches a kit and moves the project to publishing", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    useStore.getState().setPublishingKit(project.id, {
      finalTitle: "My Great Book",
      subtitle: "A guide",
      authorBio: "bio",
      bookDescription: "desc",
      backCoverCopy: "copy",
      keywords: [],
      categorySuggestions: [],
      coverConcepts: [],
      kdpChecklist: [],
    });
    const updated = useStore.getState().getProject(project.id)!;
    expect(updated.status).toBe("publishing");
    expect(updated.publishingKit?.finalTitle).toBe("My Great Book");
  });

  it("preserves id and createdAt across re-saves (upsert semantics)", () => {
    const project = useStore.getState().createProject(blueprintDraft());
    const baseKit = {
      finalTitle: "v1",
      subtitle: "",
      authorBio: "",
      bookDescription: "",
      backCoverCopy: "",
      keywords: [],
      categorySuggestions: [],
      coverConcepts: [],
      kdpChecklist: [],
    };
    useStore.getState().setPublishingKit(project.id, baseKit);
    const first = useStore.getState().getProject(project.id)!.publishingKit!;
    useStore.getState().setPublishingKit(project.id, { ...baseKit, finalTitle: "v2" });
    const second = useStore.getState().getProject(project.id)!.publishingKit!;
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.finalTitle).toBe("v2");
  });
});

describe("removeProject", () => {
  it("removes the project by id", () => {
    const a = useStore.getState().createProject(blueprintDraft({ titleOptions: ["A"] }));
    const b = useStore.getState().createProject(blueprintDraft({ titleOptions: ["B"] }));
    useStore.getState().removeProject(a.id);
    const ids = useStore.getState().projects.map((p) => p.id);
    expect(ids).toEqual([b.id]);
  });
});
