"use client";
import { useState } from "react";
import {
  StickyNote,
  ClipboardPaste,
  Link2,
  ListPlus,
  Upload,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { SourceContentType } from "@/types/book";
import { cn } from "@/lib/utils";

const TABS: {
  type: SourceContentType;
  label: string;
  icon: typeof StickyNote;
  multiline: boolean;
  placeholder: string;
}[] = [
  { type: "note", label: "Free text note", icon: StickyNote, multiline: true, placeholder: "Jot down anything you want in the book…" },
  { type: "pasted", label: "Paste content", icon: ClipboardPaste, multiline: true, placeholder: "Paste an existing post, transcript, or article…" },
  { type: "link", label: "Add link", icon: Link2, multiline: false, placeholder: "https://… (a post, video, or article)" },
  { type: "chapter_idea", label: "Chapter idea", icon: ListPlus, multiline: false, placeholder: "A chapter you already know you want…" },
];

const TYPE_META: Record<SourceContentType, { label: string; icon: typeof StickyNote }> = {
  note: { label: "Note", icon: StickyNote },
  pasted: { label: "Pasted", icon: ClipboardPaste },
  link: { label: "Link", icon: Link2 },
  chapter_idea: { label: "Chapter idea", icon: ListPlus },
  document: { label: "Document", icon: Upload },
};

export function SourceContentUploader({ hint }: { hint: string }) {
  const sources = useStore((s) => s.draft.sourceContent);
  const addSource = useStore((s) => s.addSource);
  const removeSource = useStore((s) => s.removeSource);

  const [activeTab, setActiveTab] = useState<SourceContentType>("note");
  const [value, setValue] = useState("");

  const active = TABS.find((t) => t.type === activeTab)!;

  function add() {
    const text = value.trim();
    if (!text) return;
    const title =
      activeTab === "link"
        ? text.replace(/^https?:\/\//, "").slice(0, 40)
        : text.split(/\n/)[0].slice(0, 48) || TYPE_META[activeTab].label;
    addSource({ type: activeTab, title, content: text });
    setValue("");
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-subtle">{hint}</p>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => {
              setActiveTab(t.type);
              setValue("");
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === t.type
                ? "border-copper bg-copper-soft text-copper-dark"
                : "border-line bg-card text-subtle hover:text-ink"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {active.multiline ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={active.placeholder}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={active.placeholder}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
        )}
        <div className="flex items-center justify-between">
          {/* Upload is a placeholder in the MVP */}
          <label className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm text-subtle/70" title="File storage coming soon">
            <Upload className="h-4 w-4" />
            Upload document (coming soon)
          </label>
          <Button size="sm" variant="secondary" onClick={add} disabled={!value.trim()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {sources.length > 0 ? (
        <ul className="space-y-2">
          {sources.map((s) => {
            const meta = TYPE_META[s.type];
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-copper-soft text-copper-dark">
                  <meta.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.title}</div>
                  <div className="truncate text-xs text-subtle">{meta.label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSource(s.id)}
                  className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove source"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-canvas/50 px-4 py-6 text-center text-sm text-subtle">
          No sources added yet — add a note, paste content, or skip this step.
        </div>
      )}
    </div>
  );
}
