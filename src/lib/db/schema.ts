// ===========================================================================
// Drizzle schema — the production data model for Book Studio AI.
//
// The MVP persists to the browser (see src/lib/store.ts) so it runs with zero
// setup. When you're ready for real persistence:
//   1. Provision Railway Postgres, set DATABASE_URL
//   2. `npm run db:push`
//   3. Replace the store actions with server actions that query these tables.
// The table columns intentionally mirror the TypeScript domain types.
// ===========================================================================
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookProjects = pgTable("book_projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  bookType: text("book_type").notNull(),
  goal: text("goal"),
  audience: text("audience"),
  initialPrompt: text("initial_prompt"),
  status: text("status").notNull().default("draft"),
  genreData: jsonb("genre_data").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sourceContent = pgTable("source_content", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookBlueprints = pgTable("book_blueprints", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  titleOptionsJson: jsonb("title_options_json").$type<string[]>(),
  subtitleOptionsJson: jsonb("subtitle_options_json").$type<string[]>(),
  bookPromise: text("book_promise"),
  targetReader: text("target_reader"),
  tone: text("tone"),
  tableOfContentsJson: jsonb("table_of_contents_json").$type<string[]>(),
  chapterSummariesJson: jsonb("chapter_summaries_json").$type<
    { title: string; summary: string }[]
  >(),
  estimatedLength: text("estimated_length"),
  nextStepsJson: jsonb("next_steps_json").$type<string[]>(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chapters = pgTable("chapters", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content").default(""),
  orderIndex: integer("order_index").notNull().default(0),
  status: text("status").notNull().default("not_started"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const publishingKits = pgTable("publishing_kits", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  finalTitle: text("final_title"),
  subtitle: text("subtitle"),
  authorBio: text("author_bio"),
  bookDescription: text("book_description"),
  backCoverCopy: text("back_cover_copy"),
  keywordsJson: jsonb("keywords_json").$type<string[]>(),
  categorySuggestionsJson: jsonb("category_suggestions_json").$type<string[]>(),
  coverConceptsJson: jsonb("cover_concepts_json").$type<string[]>(),
  kdpChecklistJson: jsonb("kdp_checklist_json").$type<
    { label: string; done: boolean }[]
  >(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("inactive"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
