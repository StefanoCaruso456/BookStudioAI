CREATE TABLE IF NOT EXISTS "builder_drafts" (
	"user_id" text PRIMARY KEY NOT NULL,
	"draft" jsonb,
	"blueprint" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_projects" ADD COLUMN "last_edited_chapter_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "builder_drafts" ADD CONSTRAINT "builder_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
