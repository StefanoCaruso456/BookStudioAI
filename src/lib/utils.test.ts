import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, uid, nowIso, formatDate, relativeTime } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("uid", () => {
  it("uses the default prefix", () => {
    expect(uid()).toMatch(/^id_/);
  });

  it("honors a custom prefix", () => {
    expect(uid("proj")).toMatch(/^proj_/);
  });

  it("produces unique ids across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()));
    expect(ids.size).toBe(1000);
  });
});

describe("nowIso", () => {
  it("returns a valid ISO-8601 timestamp", () => {
    const iso = nowIso();
    expect(iso).toBe(new Date(iso).toISOString());
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date", () => {
    // Use a fixed date; exact text depends on the runtime locale, so just
    // assert the parts we control are present.
    const out = formatDate("2026-06-19T00:00:00.000Z");
    expect(out).toMatch(/2026/);
    expect(out.length).toBeGreaterThan(0);
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

  it("reports 'just now' for differences under ~30 seconds", () => {
    // The threshold rounds to the nearest minute, so 30s already reads "1m ago".
    expect(relativeTime(ago(10 * 1000))).toBe("just now");
  });

  it("reports minutes under an hour", () => {
    expect(relativeTime(ago(5 * 60 * 1000))).toBe("5m ago");
    expect(relativeTime(ago(59 * 60 * 1000))).toBe("59m ago");
  });

  it("reports hours under a day", () => {
    expect(relativeTime(ago(3 * 60 * 60 * 1000))).toBe("3h ago");
  });

  it("reports days under a month", () => {
    expect(relativeTime(ago(5 * 24 * 60 * 60 * 1000))).toBe("5d ago");
  });

  it("falls back to a formatted date past ~30 days", () => {
    const out = relativeTime(ago(60 * 24 * 60 * 60 * 1000));
    expect(out).not.toMatch(/ago|just now/);
    expect(out).toMatch(/\d{4}/);
  });
});
