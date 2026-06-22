// ===========================================================================
// Book Studio AI — core domain types
// Single source of truth shared by the UI, the client store, and (later) the
// Drizzle schema + AI function interfaces.
// ===========================================================================

export type BookType =
  | "cookbook"
  | "fitness_diet"
  | "coaching_self_help"
  | "travel_guide"
  | "memoir_biography"
  | "business_expert"
  | "other";

export type BookGoal =
  | "build_authority"
  | "sell_to_audience"
  | "teach_skill"
  | "share_story"
  | "generate_leads"
  | "personal_legacy";

export type ChapterStatus =
  | "not_started"
  | "drafting"
  | "needs_review"
  | "complete";

export type SubscriptionPlan = "free" | "pro";

/** Stripe-synced subscription status (Phase 5). */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "inactive";

export type ProjectStatus =
  | "draft"
  | "blueprint"
  | "writing"
  | "editing"
  | "publishing";

export interface User {
  id: string;
  clerkUserId?: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Audience {
  description: string;
  examples?: string[];
}

export type SourceContentType =
  | "note"
  | "pasted"
  | "document"
  | "link"
  | "chapter_idea";

export interface SourceContent {
  id: string;
  projectId: string;
  type: SourceContentType;
  title: string;
  content: string;
  /** genre-specific structured payload (recipe, workout, itinerary, etc.) */
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BookBlueprint {
  id: string;
  projectId: string;
  titleOptions: string[];
  subtitleOptions: string[];
  bookPromise: string;
  targetReader: string;
  tone: string;
  tableOfContents: string[];
  chapterSummaries: { title: string; summary: string }[];
  estimatedLength: string;
  nextSteps: string[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  content: string;
  orderIndex: number;
  status: ChapterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublishingKit {
  id: string;
  projectId: string;
  finalTitle: string;
  subtitle: string;
  authorBio: string;
  bookDescription: string;
  backCoverCopy: string;
  keywords: string[];
  categorySuggestions: string[];
  coverConcepts: string[];
  kdpChecklist: { label: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface BookProject {
  id: string;
  userId: string;
  title: string;
  bookType: BookType;
  goal?: BookGoal;
  audience?: Audience;
  initialPrompt?: string;
  status: ProjectStatus;
  /** structured answers from the genre-specific wizard step */
  genreData: Record<string, string>;
  /** Resume deep-link target: the most recently edited chapter (Phase 3, ADR-4). */
  lastEditedChapterId?: string;
  sourceContent: SourceContent[];
  blueprint?: BookBlueprint;
  chapters: Chapter[];
  publishingKit?: PublishingKit;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  priceId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}
