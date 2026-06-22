import { describe, it, expect } from "vitest";
import { computeIsPro } from "./entitlement";

describe("computeIsPro", () => {
  it("grants Pro when active + pro", () => {
    expect(computeIsPro({ plan: "pro", status: "active" })).toBe(true);
  });

  it("grants Pro when trialing + pro", () => {
    expect(computeIsPro({ plan: "pro", status: "trialing" })).toBe(true);
  });

  it("denies a canceled pro subscription", () => {
    expect(computeIsPro({ plan: "pro", status: "canceled" })).toBe(false);
  });

  it("denies a past_due pro subscription", () => {
    expect(computeIsPro({ plan: "pro", status: "past_due" })).toBe(false);
  });

  it("denies an inactive pro subscription", () => {
    expect(computeIsPro({ plan: "pro", status: "inactive" })).toBe(false);
  });

  it("denies the free plan even when active", () => {
    expect(computeIsPro({ plan: "free", status: "active" })).toBe(false);
  });

  it("denies missing / null inputs", () => {
    expect(computeIsPro({ plan: null, status: null })).toBe(false);
    expect(computeIsPro({ plan: undefined, status: undefined })).toBe(false);
  });
});
