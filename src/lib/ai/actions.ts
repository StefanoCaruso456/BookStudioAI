"use server";
// ===========================================================================
// Server actions — the public async AI surface used by the UI.
//
// When OPENAI_API_KEY is set we call OpenAI (gpt-4o) on the server; otherwise
// (and on any API error) we fall back to the deterministic placeholder output,
// so local dev, CI, and key-less deploys keep working. The API key never
// reaches the client because these run only on the server.
// ===========================================================================
import { auth } from "@/auth";
import { isPro } from "@/lib/data/subscriptions";
import { generateBookBlueprint as fallbackBlueprint } from "./generateBookBlueprint";
import {
  generateChapterDraft as fallbackChapterDraft,
  rewriteChapter as fallbackRewrite,
} from "./chapterActions";
import { editChapter as fallbackEdit } from "./editChapter";
import { generatePublishingKit as fallbackKit } from "./generatePublishingKit";
import type {
  GenerateBlueprintInput,
  BlueprintDraft,
  GenerateChapterDraftInput,
  RewriteChapterInput,
  EditChapterInput,
  EditChapterResult,
  GeneratePublishingKitInput,
  PublishingKitDraft,
} from "./types";

const hasKey = () => !!process.env.OPENAI_API_KEY;

function warn(stage: string, err: unknown) {
  console.error(`[ai] ${stage} via OpenAI failed; using fallback:`, err);
}

/**
 * Server-side Pro gate (Phase 5, ADR-4) for the expensive chapter-AI actions.
 * The real enforcement: the SubscriptionGate modal is UX only. Throws the typed
 * "UPGRADE_REQUIRED" error the client catches to surface the upgrade prompt.
 * Blueprint + publishing-kit generation stay free and are NOT gated.
 */
async function requirePro(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  if (!(await isPro(userId))) throw new Error("UPGRADE_REQUIRED");
}

export async function generateBookBlueprint(
  input: GenerateBlueprintInput
): Promise<BlueprintDraft> {
  if (!hasKey()) return fallbackBlueprint(input);
  try {
    const { openaiBlueprint } = await import("./openai");
    return await openaiBlueprint(input);
  } catch (err) {
    warn("blueprint", err);
    return fallbackBlueprint(input);
  }
}

export async function generateChapterDraft(
  input: GenerateChapterDraftInput
): Promise<string> {
  await requirePro();
  if (!hasKey()) return fallbackChapterDraft(input);
  try {
    const { openaiChapterDraft } = await import("./openai");
    return await openaiChapterDraft(input);
  } catch (err) {
    warn("chapter draft", err);
    return fallbackChapterDraft(input);
  }
}

export async function rewriteChapter(input: RewriteChapterInput): Promise<string> {
  await requirePro();
  if (!hasKey()) return fallbackRewrite(input);
  try {
    const { openaiRewrite } = await import("./openai");
    return await openaiRewrite(input);
  } catch (err) {
    warn("rewrite", err);
    return fallbackRewrite(input);
  }
}

export async function editChapter(
  input: EditChapterInput
): Promise<EditChapterResult> {
  await requirePro();
  if (!hasKey()) return fallbackEdit(input);
  try {
    const { openaiEdit } = await import("./openai");
    return await openaiEdit(input);
  } catch (err) {
    warn("edit", err);
    return fallbackEdit(input);
  }
}

export async function generatePublishingKit(
  input: GeneratePublishingKitInput
): Promise<PublishingKitDraft> {
  if (!hasKey()) return fallbackKit(input);
  try {
    const { openaiPublishingKit } = await import("./openai");
    return await openaiPublishingKit(input);
  } catch (err) {
    warn("publishing kit", err);
    return fallbackKit(input);
  }
}
