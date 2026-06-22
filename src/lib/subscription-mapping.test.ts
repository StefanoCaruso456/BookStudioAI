import { describe, it, expect } from "vitest";
import { subscriptionFieldsFromStripe } from "./subscription-mapping";

const PERIOD_END = 1_900_000_000; // seconds since epoch

describe("subscriptionFieldsFromStripe", () => {
  it("maps an active subscription to Pro and converts the period end to a Date", () => {
    const out = subscriptionFieldsFromStripe({
      status: "active",
      priceId: "price_123",
      currentPeriodEnd: PERIOD_END,
      cancelAtPeriodEnd: false,
    });
    expect(out.plan).toBe("pro");
    expect(out.status).toBe("active");
    expect(out.priceId).toBe("price_123");
    expect(out.currentPeriodEnd).toEqual(new Date(PERIOD_END * 1000));
    expect(out.cancelAtPeriodEnd).toBe(false);
  });

  it("maps a trialing subscription to Pro", () => {
    const out = subscriptionFieldsFromStripe({
      status: "trialing",
      priceId: "price_123",
      currentPeriodEnd: PERIOD_END,
      cancelAtPeriodEnd: false,
    });
    expect(out.plan).toBe("pro");
    expect(out.status).toBe("trialing");
  });

  it("downgrades a canceled subscription to free", () => {
    const out = subscriptionFieldsFromStripe({
      status: "canceled",
      priceId: "price_123",
      currentPeriodEnd: PERIOD_END,
      cancelAtPeriodEnd: true,
    });
    expect(out.plan).toBe("free");
    expect(out.status).toBe("canceled");
    expect(out.cancelAtPeriodEnd).toBe(true);
  });

  it("keeps past_due (downgraded) so access is blocked until payment clears", () => {
    const out = subscriptionFieldsFromStripe({
      status: "past_due",
      priceId: "price_123",
      currentPeriodEnd: PERIOD_END,
      cancelAtPeriodEnd: false,
    });
    expect(out.plan).toBe("free");
    expect(out.status).toBe("past_due");
  });

  it("maps unknown / unpaid statuses to inactive + free", () => {
    const out = subscriptionFieldsFromStripe({
      status: "unpaid",
      priceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
    expect(out.plan).toBe("free");
    expect(out.status).toBe("inactive");
    expect(out.priceId).toBeNull();
    expect(out.currentPeriodEnd).toBeNull();
  });
});
