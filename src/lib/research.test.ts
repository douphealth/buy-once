import { describe, it, expect } from "vitest";
import { ownershipCost, status, devices } from "./research";

describe("ownership cost", () => {
  it("adds monthly plan over the horizon to the device price", () => {
    expect(ownershipCost({ price: 99, monthly: 4.99, annual: 49.99, billing: "monthly", years: 1 }).total).toBeCloseTo(158.88);
  });
  it("skips hardware when already owned and subtracts trial months", () => {
    expect(ownershipCost({ price: 99, monthly: 10, annual: 100, billing: "monthly", years: 1, trialMonths: 2, owned: true }).total).toBe(100);
  });
});
describe("status", () => {
  it("never treats unestablished claims as documented", () => {
    expect(status("not established")).toBe("unknown");
    expect(status("conditional")).toBe("partial");
  });
  it("ships all 21 researched devices", () => expect(devices.length).toBe(21));
});
