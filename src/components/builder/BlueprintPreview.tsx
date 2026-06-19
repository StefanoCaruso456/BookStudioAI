"use client";
import {
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Target,
  Users,
  Palette,
  Ruler,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { BlueprintDraft } from "@/lib/ai";
import { cn } from "@/lib/utils";

export function BlueprintPreview({
  blueprint,
  onChange,
  onApprove,
  onRegenerate,
  regenerating,
  approving,
}: {
  blueprint: BlueprintDraft;
  onChange: (patch: Partial<BlueprintDraft>) => void;
  onApprove: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
  approving?: boolean;
}) {
  function selectTitle(i: number) {
    const arr = [...blueprint.titleOptions];
    const [picked] = arr.splice(i, 1);
    onChange({ titleOptions: [picked, ...arr] });
  }
  function selectSubtitle(i: number) {
    const arr = [...blueprint.subtitleOptions];
    const [picked] = arr.splice(i, 1);
    onChange({ subtitleOptions: [picked, ...arr] });
  }
  function updateChapter(i: number, patch: Partial<{ title: string; summary: string }>) {
    const chapters = blueprint.chapterSummaries.map((c, idx) =>
      idx === i ? { ...c, ...patch } : c
    );
    onChange({
      chapterSummaries: chapters,
      tableOfContents: chapters.map((c) => c.title),
    });
  }
  function removeChapter(i: number) {
    const chapters = blueprint.chapterSummaries.filter((_, idx) => idx !== i);
    onChange({
      chapterSummaries: chapters,
      tableOfContents: chapters.map((c) => c.title),
    });
  }
  function addChapter() {
    const chapters = [
      ...blueprint.chapterSummaries,
      { title: `New Chapter ${blueprint.chapterSummaries.length + 1}`, summary: "Describe what this chapter covers." },
    ];
    onChange({
      chapterSummaries: chapters,
      tableOfContents: chapters.map((c) => c.title),
    });
  }

  return (
    <div className="space-y-6">
      {/* meta strip */}
      <div className="grid gap-3 sm:grid-cols-2">
        <MetaField icon={Target} label="Book promise">
          <Textarea
            value={blueprint.bookPromise}
            onChange={(e) => onChange({ bookPromise: e.target.value })}
            className="min-h-[64px] text-sm"
          />
        </MetaField>
        <div className="grid gap-3">
          <MetaField icon={Users} label="Target reader">
            <Input
              value={blueprint.targetReader}
              onChange={(e) => onChange({ targetReader: e.target.value })}
            />
          </MetaField>
          <div className="grid grid-cols-2 gap-3">
            <MetaField icon={Palette} label="Tone">
              <Input
                value={blueprint.tone}
                onChange={(e) => onChange({ tone: e.target.value })}
              />
            </MetaField>
            <MetaField icon={Ruler} label="Estimated length">
              <div className="flex h-11 items-center rounded-xl border border-line bg-canvas/60 px-3 text-sm text-subtle">
                {blueprint.estimatedLength}
              </div>
            </MetaField>
          </div>
        </div>
      </div>

      {/* titles + subtitles */}
      <div className="grid gap-5 sm:grid-cols-2">
        <OptionList
          title="Title options"
          hint="Pick your favourite — it becomes the working title"
          options={blueprint.titleOptions}
          onSelect={selectTitle}
        />
        <OptionList
          title="Subtitle options"
          hint="Choose the subtitle that fits best"
          options={blueprint.subtitleOptions}
          onSelect={selectSubtitle}
        />
      </div>

      {/* table of contents */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold tracking-tight">Table of contents</h3>
            <p className="text-sm text-subtle">
              Edit chapter titles and summaries, or add and remove chapters.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={addChapter}>
            <Plus className="h-4 w-4" />
            Add chapter
          </Button>
        </div>
        <div className="space-y-2.5">
          {blueprint.chapterSummaries.map((c, i) => (
            <Card key={i} className="p-3.5">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper-soft text-xs font-semibold text-copper-dark">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={c.title}
                    onChange={(e) => updateChapter(i, { title: e.target.value })}
                    className="h-9 font-medium"
                  />
                  <Textarea
                    value={c.summary}
                    onChange={(e) => updateChapter(i, { summary: e.target.value })}
                    className="min-h-[52px] text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeChapter(i)}
                  className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove chapter"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* next steps + actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-copper-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Ready to start writing?</h3>
          <p className="text-sm text-subtle">
            Approving creates {blueprint.chapterSummaries.length} chapters and opens
            your workspace.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={onRegenerate} loading={regenerating}>
            {!regenerating && <RefreshCw className="h-4 w-4" />}
            Regenerate
          </Button>
          <Button onClick={onApprove} loading={approving}>
            {!approving && <Check className="h-4 w-4" />}
            Approve &amp; Start Writing
            {!approving && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetaField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-subtle">
        <Icon className="h-4 w-4 text-copper" />
        {label}
      </div>
      {children}
    </div>
  );
}

function OptionList({
  title,
  hint,
  options,
  onSelect,
}: {
  title: string;
  hint: string;
  options: string[];
  onSelect: (i: number) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mb-3 text-sm text-subtle">{hint}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const chosen = i === 0;
          return (
            <button
              key={`${opt}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 text-left text-sm transition-all",
                chosen
                  ? "border-copper ring-2 ring-copper/20"
                  : "border-line hover:border-copper/40"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  chosen ? "border-copper bg-copper text-white" : "border-line"
                )}
              >
                {chosen && <Check className="h-2.5 w-2.5" />}
              </span>
              <span className={cn(chosen && "font-medium")}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
