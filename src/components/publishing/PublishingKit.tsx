"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  BookOpen,
  Check,
  Save,
  RefreshCw,
  Tag,
  FolderTree,
  Image as ImageIcon,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { generatePublishingKit, type PublishingKitDraft } from "@/lib/ai";
import { setPublishingKitAction } from "@/lib/data/actions";
import type {
  BookProject,
  PublishingKit as PublishingKitType,
} from "@/types/book";
import { cn } from "@/lib/utils";

type ExportFormat = "pdf" | "epub" | "docx";

export function PublishingKit({ project }: { project: BookProject }) {
  const [kit, setKit] = useState<PublishingKitDraft | null>(
    project.publishingKit ? stripKit(project.publishingKit) : null
  );
  const [authorName, setAuthorName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const bp = project.blueprint;

  async function exportBook(format: ExportFormat) {
    setExporting(format);
    setExportError(null);
    try {
      const res = await fetch(`/api/export/${project.id}?format=${format}`);
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title || "book"}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(`Couldn't generate the ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const result = await generatePublishingKit({
        bookType: project.bookType,
        title: bp?.titleOptions[0] ?? project.title,
        subtitle: bp?.subtitleOptions[0] ?? "",
        bookPromise: bp?.bookPromise ?? "",
        targetReader: bp?.targetReader ?? "your readers",
        tone: bp?.tone ?? "Clear and warm",
        authorName,
        goal: project.goal,
      });
      setKit(result);
      void setPublishingKitAction(project.id, result);
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setGenerating(false);
    }
  }

  function update(patch: Partial<PublishingKitDraft>) {
    setKit((k) => (k ? { ...k, ...patch } : k));
  }
  function save() {
    if (!kit) return;
    void setPublishingKitAction(project.id, kit);
    setSavedAt(new Date().toLocaleTimeString());
  }
  function toggleCheck(i: number) {
    if (!kit) return;
    const kdpChecklist = kit.kdpChecklist.map((c, idx) =>
      idx === i ? { ...c, done: !c.done } : c
    );
    update({ kdpChecklist });
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/project/${project.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>
        {kit && (
          <Button variant="secondary" size="sm" onClick={save}>
            <Save className="h-4 w-4" />
            {savedAt ? `Saved ${savedAt}` : "Save"}
          </Button>
        )}
      </div>

      <div className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight">Publishing kit</h1>
        <p className="mt-2 text-subtle">
          Everything you need to publish {project.title} — generated and ready to
          edit.
        </p>
      </div>

      {!kit ? (
        <Card className="mt-8 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Generate your publishing kit</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-subtle">
            We&rsquo;ll create your title, description, back-cover copy, keywords,
            categories, cover concepts, and a KDP checklist.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name (optional)"
            />
            <Button onClick={generate} loading={generating}>
              {!generating && <Sparkles className="h-4 w-4" />}
              Generate publishing kit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-5">
          <Section title="Title & subtitle">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Final title">
                <Input
                  value={kit.finalTitle}
                  onChange={(e) => update({ finalTitle: e.target.value })}
                />
              </Field>
              <Field label="Subtitle">
                <Input
                  value={kit.subtitle}
                  onChange={(e) => update({ subtitle: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section title="Author bio">
            <Textarea
              value={kit.authorBio}
              onChange={(e) => update({ authorBio: e.target.value })}
              className="min-h-[96px]"
            />
          </Section>

          <Section title="Book description">
            <Textarea
              value={kit.bookDescription}
              onChange={(e) => update({ bookDescription: e.target.value })}
              className="min-h-[140px]"
            />
          </Section>

          <Section title="Back cover copy">
            <Textarea
              value={kit.backCoverCopy}
              onChange={(e) => update({ backCoverCopy: e.target.value })}
              className="min-h-[120px]"
            />
          </Section>

          <div className="grid gap-5 sm:grid-cols-2">
            <Section title="Keywords" icon={Tag}>
              <Input
                value={kit.keywords.join(", ")}
                onChange={(e) =>
                  update({
                    keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {kit.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-dark"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Category suggestions" icon={FolderTree}>
              <ul className="space-y-1.5 text-sm">
                {kit.categorySuggestions.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title="Cover concept prompts" icon={ImageIcon}>
            <ul className="space-y-2">
              {kit.coverConcepts.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-sm text-ink/80"
                >
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Export" icon={FileText}>
            <p className="mb-3 text-sm text-subtle">
              Download your finished book — title page, table of contents, and
              every chapter in order.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                loading={exporting === "pdf"}
                disabled={exporting !== null}
                onClick={() => exportBook("pdf")}
              >
                {exporting !== "pdf" && <FileText className="h-4 w-4" />}
                {exporting === "pdf" ? "Generating…" : "Export PDF"}
              </Button>
              <Button
                variant="secondary"
                loading={exporting === "epub"}
                disabled={exporting !== null}
                onClick={() => exportBook("epub")}
              >
                {exporting !== "epub" && <BookOpen className="h-4 w-4" />}
                {exporting === "epub" ? "Generating…" : "Export EPUB"}
              </Button>
              <Button
                variant="secondary"
                loading={exporting === "docx"}
                disabled={exporting !== null}
                onClick={() => exportBook("docx")}
              >
                {exporting !== "docx" && <FileText className="h-4 w-4" />}
                {exporting === "docx" ? "Generating…" : "Export DOCX"}
              </Button>
            </div>
            {exportError && (
              <p className="mt-2.5 text-sm text-red-600">{exportError}</p>
            )}
          </Section>

          <Section title="KDP checklist" icon={ListChecks}>
            <ul className="space-y-1.5">
              {kit.kdpChecklist.map((item, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleCheck(i)}
                    className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left text-sm transition-colors hover:bg-canvas"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        item.done
                          ? "border-brand bg-brand text-white"
                          : "border-line"
                      )}
                    >
                      {item.done && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className={cn(item.done && "text-subtle line-through")}>
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <div className="flex justify-between gap-2 border-t border-line pt-5">
            <Button variant="ghost" onClick={generate} loading={generating}>
              {!generating && <RefreshCw className="h-4 w-4" />}
              Regenerate
            </Button>
            <Button onClick={save}>
              <Save className="h-4 w-4" />
              Save kit
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-brand" />}
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-subtle">{label}</label>
      {children}
    </div>
  );
}

function stripKit(kit: PublishingKitType): PublishingKitDraft {
  const { id, projectId, createdAt, updatedAt, ...rest } = kit;
  return rest;
}
