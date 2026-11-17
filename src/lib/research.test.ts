import { describe, it, expect } from "vitest";
import { ownershipCost, status, devices, deviceFacts, estimateCost, filterDevices, parseDirectoryFilters, planPrice, recordingStatus } from "./research";

describe("ownership cost", () => {
  it("adds monthly plan over the horizon to the device price", () => {
    expect(ownershipCost({ price: 99, monthly: 4.99, annual: 49.99, billing: "monthly", years: 1 }).total).toBeCloseTo(158.88);
  });
  it("skips hardware when already owned and subtracts trial months", () => {
    expect(ownershipCost({ price: 99, monthly: 10, annual: 100, billing: "monthly", years: 1, trialMonths: 2, owned: true }).total).toBe(100);
  });
});
describe("audit integrity rules", () => {
  const find = (slug: string) => { const d = devices.find(d => d.slug === slug); if (!d) throw new Error(`Missing fixture: ${slug}`); return d; };
  it("uses metrics, history/export and account attributes for rings, not video recording", () => {
    expect(deviceFacts(find("oura-ring-4")).map(f => f.key)).toEqual(["metrics", "history", "account"]);
  });
  it("keeps unresolved history/export explicitly unknown", () => {
    expect(deviceFacts(find("ringconn-gen-2")).find(f => f.key === "history")?.verdict).toBe("unknown");
  });
  it("does not interpret the camera's legacy not-applicable marker as a wearable attribute", () => {
    expect(recordingStatus(find("reolink-rlc-810a"))).toBe("yes");
  });
  it("does not substitute missing device prices with zero in ownership totals", () => {
    expect(estimateCost(find("reolink-rlc-810a"))).toBeNull();
  });
  it("keeps unresearched optional-plan legacy zeros unverified", () => {
    expect(planPrice(find("wyze-video-doorbell-pro"))).toBeNull();
  });
  it("does not omit required storage hardware from an apparently complete total", () => {
    expect(estimateCost(find("blink-video-doorbell-2nd-gen"))).toBeNull();
  });
  it("includes three annual memberships for an Oura estimate", () => {
    expect(estimateCost(find("oura-ring-4"), 3)).toBeCloseTo(558.97);
  });
  it("uses no mandatory membership for RingConn core-metrics estimates", () => {
    expect(estimateCost(find("ringconn-gen-2"), 3)).toBe(299);
  });
  it("excludes unpriced totals rather than treating them as free budget matches", () => {
    expect(filterDevices(parseDirectoryFilters({ budget: 300 })).map(d => d.slug)).toEqual(["ringconn-gen-2", "ringconn-gen-2-air"]);
  });
  it("requires verified no-plan recording or full core ring metrics for the subscription filter", () => {
    const list = filterDevices(parseDirectoryFilters({ cat: "wearable", free: "true" }));
    expect(list.map(d => d.brand)).toEqual(["RingConn", "RingConn"]);
  });
  it("excludes wearables and unresolved models from offline recording matches", () => {
    expect(filterDevices(parseDirectoryFilters({ offline: "true" })).map(d => d.slug).sort()).toEqual(["reolink-video-doorbell-poe", "reolink-video-doorbell-wifi", "wyze-video-doorbell-v2"]);
  });
});
describe("status", () => {
  it("never treats unestablished claims as documented", () => {
    expect(status("not established")).toBe("unknown");
    expect(status("conditional")).toBe("partial");
  });
  it("ships all 21 researched devices", () => expect(devices.length).toBe(21));
});
