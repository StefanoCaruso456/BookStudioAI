"use client";
import { Loader2, Check, X, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDIT_MODE_LIST, editModeLabel } from "@/lib/ai";
import type { EditMode } from "@/lib/ai";

export function EditingToolbar({
  busyMode,
  suggestion,
  onEdit,
  onApply,
  onDismiss,
}: {
  busyMode: EditMode | null;
  suggestion: { mode: EditMode; summary: string } | null;
  onEdit: (mode: EditMode) => void;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
          <PenTool className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">Editing modes</h3>
      </div>

      <div className="mt-3 grid gap-2">
        {EDIT_MODE_LIST.map((mode) => (
          <Button
            key={mode}
            variant="secondary"
            size="sm"
            className="justify-start"
            disabled={!!busyMode}
            onClick={() => onEdit(mode)}
          >
            {busyMode === mode ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            )}
            {editModeLabel(mode)}
          </Button>
        ))}
      </div>

      {suggestion && (
        <div className="mt-3 rounded-xl border border-brand/30 bg-brand-soft/40 p-3">
          <div className="text-xs font-semibold text-brand-dark">
            {editModeLabel(suggestion.mode)} suggestion
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink/80">
            {suggestion.summary}
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" onClick={onApply}>
              <Check className="h-3.5 w-3.5" />
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
