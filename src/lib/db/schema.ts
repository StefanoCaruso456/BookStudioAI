// ===========================================================================
// Drizzle schema — the production data model for Book Studio AI.
//
// Phase 1 (see docs/specs/phase-1-database.md):
//   • Auth.js adapter tables (users / accounts / sessions / verification_tokens)
//   • Book domain tables with user_id / project_id foreign keys (cascade),
//     explicit indexes on every FK + query path, and Drizzle relations.
//
// Migrations are generated SQL committed under /drizzle (ADR-3): never push
// against prod.
// ===========================================================================
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ───────────────────────────── Auth.js (adapter) ──────────────────────────

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdx: index("accounts_user_idx").on(account.userId),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ───────────────────────────── Book domain ────────────────────────────────

export const bookProjects = pgTable(
  "book_projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    bookType: text("book_type").notNull(),
    goal: text("goal"),
    audience: text("audience"),
    initialPrompt: text("initial_prompt"),
    status: text("status").notNull().default("draft"),
    genreData: jsonb("genre_data").$type<Record<string, string>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    // Dashboard list: a user's projects, newest first.
    userUpdatedIdx: index("book_projects_user_updated_idx").on(
      t.userId,
      t.updatedAt
    ),
  })
);

export const sourceContent = pgTable(
  "source_content",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => bookProjects.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index("source_content_project_idx").on(t.projectId),
  })
);

export const bookBlueprints = pgTable(
  "book_blueprints",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => bookProjects.id, { onDelete: "cascade" }),
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
  },
  (t) => ({
    // One blueprint per project.
    projectUnique: uniqueIndex("book_blueprints_project_unique").on(t.projectId),
  })
);

export const chapters = pgTable(
  "chapters",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => bookProjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    status: text("status").notNull().default("not_started"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    projectOrderIdx: index("chapters_project_order_idx").on(
      t.projectId,
      t.orderIndex
    ),
  })
);

export const publishingKits = pgTable(
  "publishing_kits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => bookProjects.id, { onDelete: "cascade" }),
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
  },
  (t) => ({
    projectUnique: uniqueIndex("publishing_kits_project_unique").on(t.projectId),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("free"),
    status: text("status").notNull().default("inactive"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("subscriptions_user_idx").on(t.userId),
  })
);

// ───────────────────────────── Relations ──────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(bookProjects),
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const bookProjectsRelations = relations(bookProjects, ({ one, many }) => ({
  user: one(users, { fields: [bookProjects.userId], references: [users.id] }),
  blueprint: one(bookBlueprints, {
    fields: [bookProjects.id],
    references: [bookBlueprints.projectId],
  }),
  publishingKit: one(publishingKits, {
    fields: [bookProjects.id],
    references: [publishingKits.projectId],
  }),
  chapters: many(chapters),
  sourceContent: many(sourceContent),
}));

export const bookBlueprintsRelations = relations(bookBlueprints, ({ one }) => ({
  project: one(bookProjects, {
    fields: [bookBlueprints.projectId],
    references: [bookProjects.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  project: one(bookProjects, {
    fields: [chapters.projectId],
    references: [bookProjects.id],
  }),
}));

export const sourceContentRelations = relations(sourceContent, ({ one }) => ({
  project: one(bookProjects, {
    fields: [sourceContent.projectId],
    references: [bookProjects.id],
  }),
}));

export const publishingKitsRelations = relations(publishingKits, ({ one }) => ({
  project: one(bookProjects, {
    fields: [publishingKits.projectId],
    references: [bookProjects.id],
  }),
}));
