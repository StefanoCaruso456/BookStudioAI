// Read-only database inspector. Runs in CI (GitHub's network can reach Railway;
// local/sandbox often can't). Prints the schema + current rows for the auth
// tables and row counts for the rest. OAuth tokens are intentionally NEVER
// selected/printed.
import postgres from "postgres";

const url = process.env.DATABASE_URL_PUBLIC ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_PUBLIC is not set.");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  prepare: false,
});

function h(title) {
  console.log(`\n===== ${title} =====`);
}

try {
  h("TABLES");
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`;
  console.log(tables.map((t) => t.table_name).join("\n"));

  h("APPLIED MIGRATIONS");
  try {
    const m = await sql`SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id`;
    console.log(m);
  } catch {
    console.log("(no drizzle.__drizzle_migrations table — checking journal differently)");
  }

  h("users  (id, name, email, email_verified, image, created_at)");
  const userCount = await sql`SELECT count(*)::int AS n FROM users`;
  console.log(`row count: ${userCount[0].n}`);
  const users = await sql`
    SELECT id, name, email, email_verified, image, created_at
    FROM users ORDER BY created_at`;
  console.log(JSON.stringify(users, null, 2));

  h("accounts  (tokens NOT shown)");
  const acctCount = await sql`SELECT count(*)::int AS n FROM accounts`;
  console.log(`row count: ${acctCount[0].n}`);
  const accounts = await sql`
    SELECT user_id, type, provider, provider_account_id, scope
    FROM accounts`;
  console.log(JSON.stringify(accounts, null, 2));

  h("ROW COUNTS (other tables)");
  for (const t of [
    "sessions",
    "verification_tokens",
    "book_projects",
    "book_blueprints",
    "chapters",
    "source_content",
    "publishing_kits",
    "subscriptions",
  ]) {
    const r = await sql.unsafe(`SELECT count(*)::int AS n FROM ${t}`);
    console.log(`${t}: ${r[0].n}`);
  }

  h("profiles  (onboarding state — no secrets)");
  const profiles = await sql`
    SELECT user_id, persona, primary_goal, use_case, referral_source,
           marketing_opt_in, onboarding_completed_at
    FROM profiles ORDER BY created_at`;
  console.log(`row count: ${profiles.length}`);
  console.log(JSON.stringify(profiles, null, 2));

  h("consent_log  (audit trail)");
  const consents = await sql`
    SELECT user_id, type, version, accepted_at FROM consent_log
    ORDER BY accepted_at`;
  console.log(`row count: ${consents.length}`);
  console.log(JSON.stringify(consents, null, 2));

  h("events  (funnel)");
  const events = await sql`
    SELECT user_id, name, created_at FROM events
    ORDER BY created_at DESC LIMIT 25`;
  console.log(`row count (latest 25 shown): ${events.length}`);
  console.log(JSON.stringify(events, null, 2));
} catch (e) {
  console.error("INSPECTION ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}

// re-run: verify fresh-user onboarding completion (Phase 2 acceptance)
