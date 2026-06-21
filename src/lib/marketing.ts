// ===========================================================================
// Marketing site content + data.
//
// NOTE: testimonials and metrics below are ILLUSTRATIVE PLACEHOLDERS, kept
// intentionally non-impersonating (role-based, no fabricated real people).
// Replace `TESTIMONIALS` and `METRICS` with real, verified content before
// treating them as social proof.
// ===========================================================================
import type { LucideIcon } from "lucide-react";
import {
  NotebookPen,
  FileText,
  Instagram,
  Mic,
  Mail,
  Utensils,
  Quote,
  GraduationCap,
  Briefcase,
  Plane,
  Heart,
  Dumbbell,
  BookOpen,
  Image,
  Video,
} from "lucide-react";

/** Raw inputs that "flow into" the book — used in the hero + narrative scenes. */
export interface ContentItem {
  label: string;
  icon: LucideIcon;
}

export const CONTENT_ITEMS: ContentItem[] = [
  { label: "Notes", icon: NotebookPen },
  { label: "Documents", icon: FileText },
  { label: "Instagram", icon: Instagram },
  { label: "Podcasts", icon: Mic },
  { label: "Newsletters", icon: Mail },
  { label: "Recipes", icon: Utensils },
  { label: "Interviews", icon: Quote },
  { label: "Courses", icon: GraduationCap },
];

/** The eight stickers that float around the hero book (the six core sources
 *  plus Images and Videos). Kept separate so the narrative orbit is unaffected. */
export const HERO_ITEMS: ContentItem[] = [
  ...CONTENT_ITEMS.slice(0, 6),
  { label: "Images", icon: Image },
  { label: "Videos", icon: Video },
];

/** Book categories shown in the premium 3D showcase. */
export interface BookCategory {
  title: string;
  blurb: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the 3D cover. */
  cover: string;
  spine: string;
}

export const CATEGORIES: BookCategory[] = [
  {
    title: "Cookbook",
    blurb: "Recipes & food stories into a keepsake people cook from.",
    icon: Utensils,
    cover: "from-amber-500 to-orange-700",
    spine: "bg-orange-900",
  },
  {
    title: "Memoir",
    blurb: "The moments that shaped you, shaped into a moving narrative.",
    icon: BookOpen,
    cover: "from-rose-500 to-rose-800",
    spine: "bg-rose-900",
  },
  {
    title: "Travel Guide",
    blurb: "Your destination expertise into an inspiring, practical guide.",
    icon: Plane,
    cover: "from-sky-500 to-cyan-700",
    spine: "bg-cyan-900",
  },
  {
    title: "Self Help",
    blurb: "Your coaching framework into a transformational read.",
    icon: Heart,
    cover: "from-indigo-500 to-violet-700",
    spine: "bg-violet-900",
  },
  {
    title: "Business",
    blurb: "Your expertise into an authority-building business book.",
    icon: Briefcase,
    cover: "from-slate-600 to-slate-900",
    spine: "bg-black",
  },
  {
    title: "Fitness",
    blurb: "Your training method into a results-driven program book.",
    icon: Dumbbell,
    cover: "from-emerald-500 to-teal-700",
    spine: "bg-teal-900",
  },
];

/** Stages that build progressively in the blueprint scene. */
export const BLUEPRINT_STAGES = [
  { label: "Idea", detail: "Your raw knowledge and goals" },
  { label: "Title", detail: "A title that earns the click" },
  { label: "Outline", detail: "A structure readers can follow" },
  { label: "Chapters", detail: "Each chapter, summarised" },
  { label: "Draft", detail: "Publishable prose, in your voice" },
  { label: "Published Book", detail: "Cover, blurb, ready for KDP" },
] as const;

/** The vertical publishing journey. */
export interface JourneyStep {
  n: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    n: "01",
    title: "Capture Knowledge",
    detail:
      "Bring in notes, documents, recipes, posts, and transcripts. Nothing gets lost.",
    icon: NotebookPen,
  },
  {
    n: "02",
    title: "Build Blueprint",
    detail:
      "AI shapes your material into a title, promise, and chapter-by-chapter outline.",
    icon: FileText,
  },
  {
    n: "03",
    title: "Generate Chapters",
    detail:
      "Turn each outline into a full draft, written in your voice and your genre's form.",
    icon: BookOpen,
  },
  {
    n: "04",
    title: "Edit With AI",
    detail:
      "Developmental, clarity, and tone passes — refine without losing yourself.",
    icon: Quote,
  },
  {
    n: "05",
    title: "Publish",
    detail:
      "Cover concepts, description, keywords, and a KDP checklist. Become an author.",
    icon: GraduationCap,
  },
];

export const AUDIENCES = [
  "creators",
  "coaches",
  "chefs",
  "consultants",
  "founders",
  "experts",
];

/** Illustrative metrics — replace with real, verified numbers. */
export const METRICS = [
  { value: 12000, suffix: "+", label: "Books blueprinted" },
  { value: 60, suffix: "+", label: "Chapters in minutes" },
  { value: 6, suffix: "", label: "Genres, deeply tailored" },
  { value: 4.9, suffix: "/5", label: "Creator satisfaction" },
];

/** Illustrative, role-based testimonials — NOT real named individuals. */
export const TESTIMONIALS = [
  {
    quote:
      "I'd been “writing my book” for six years. The blueprint gave me the spine I could never find on my own.",
    role: "Self-help coach",
    initials: "SC",
  },
  {
    quote:
      "My recipes lived in five notebooks and a thousand photos. Now they're a cookbook my family will actually keep.",
    role: "Recipe creator",
    initials: "RC",
  },
  {
    quote:
      "It read my messy transcripts and handed back chapters that sounded like me — only sharper.",
    role: "Business consultant",
    initials: "BC",
  },
];
