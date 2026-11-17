import raw from "@/data/research.json";

export type Device = {
  id: string; slug: string; brand: string; model: string;
  category: "doorbell" | "camera" | "wearable"; market: string;
  without_plan: string; without_plan_recording: string; record_without_internet: string;
  vendor_independent: string; plan_monthly_usd: number | null; plan_annual_usd: number | null;
  device_price_assumption_usd: number | null; price_source_status: string;
  source_urls: string[]; reviewed: string; limitations: string;
};

export const research = raw as unknown as { updated: string; market: string; count: number; license: string; devices: Device[] };
export const devices = research.devices;
export const getDevice = (slug: string) => devices.find((d) => d.slug === slug);
export const name = (d: Device) => `${d.brand} ${d.model}`;
export const categoryLabel = { doorbell: "Doorbell", camera: "Camera", wearable: "Smart ring" } as const;

export type Status = "yes" | "partial" | "no" | "unknown";
export function status(v: string): Status {
  const s = v.toLowerCase();
  if (s === "yes") return "yes";
  if (s === "no") return "no";
  if (s.startsWith("limited") || s.startsWith("conditional") || s.startsWith("generic")) return "partial";
  return "unknown";
}
export const statusLabel: Record<Status, string> = { yes: "Yes", partial: "With conditions", no: "No", unknown: "Not verified" };

/** Total cost of ownership over `years`. */
export function ownershipCost(o: { price: number; monthly: number; annual: number; billing: "monthly" | "annual" | "none"; years: number; trialMonths?: number; extras?: number; owned?: boolean }) {
  const months = Math.max(0, Math.round(o.years * 12) - (o.trialMonths ?? 0));
  const plan = o.billing === "none" ? 0 : o.billing === "monthly" ? o.monthly * months : o.annual * (months / 12);
  const hardware = o.owned ? 0 : o.price;
  return { hardware, plan, extras: o.extras ?? 0, total: hardware + plan + (o.extras ?? 0) };
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export type Fact = { key: string; label: string; verdict: Status; detail: string };
export function recordingStatus(d: Device): Status {
  // The original camera rows incorrectly used the wearable sentinel.
  if (d.category === "wearable") return "unknown";
  if (d.without_plan_recording === "not applicable") return "yes";
  return status(d.without_plan_recording);
}
export function subscriptionFree(d: Device) {
  return d.category === "wearable" ? d.brand === "RingConn" : recordingStatus(d) === "yes";
}
export function deviceFacts(d: Device): Fact[] {
  if (d.category === "wearable") return [
    { key: "metrics", label: "Metrics without membership", verdict: d.brand === "Oura" ? "partial" : "yes", detail: d.without_plan },
    { key: "history", label: "History & data export", verdict: "unknown", detail: "Historical data access and export without membership were not separately verified in this dataset." },
    { key: "account", label: "App & account independence", verdict: status(d.vendor_independent), detail: "Continued app access, account requirements and setup after vendor shutdown are not established." },
  ];
  return [
    { key: "recording", label: "Recording without a plan", verdict: recordingStatus(d), detail: d.without_plan },
    { key: "offline", label: "Recording without internet", verdict: status(d.record_without_internet), detail: status(d.record_without_internet) === "unknown" ? "Not verified for this exact model. Local storage alone does not establish offline recording." : `${d.record_without_internet}. ${d.limitations}` },
    { key: "retention", label: "Storage & retention", verdict: /three.hour|six hours|8 GB|128GB|512GB|512GB/i.test(d.without_plan) ? "partial" : "unknown", detail: `${d.without_plan} Exact retention depends on settings, capacity and usage; it is not separately verified here.` },
  ];
}
export function extrasNote(d: Device): string {
  if (d.slug === "blink-video-doorbell-2nd-gen") return "Compatible Sync Module and USB/microSD storage required; prices unverified.";
  if (d.slug === "unifi-g4-doorbell-pro") return "Compatible UniFi Protect console and storage required; prices unverified.";
  if (d.slug === "aqara-smart-video-doorbell-g4") return "Chime-based storage; microSD and wired power for continuous recording. Bundle contents unverified.";
  if (d.slug === "reolink-video-doorbell-poe") return "PoE power/network hardware and local storage required; prices unverified.";
  if (/microSD|SD recording/i.test(d.without_plan)) return "Local storage required; included storage and installation costs unverified.";
  return "Required extras and bundle contents not separately verified.";
}
export function planPrice(d: Device): number | null {
  // Legacy zeros represented an unresearched optional plan, not a free plan.
  return d.plan_annual_usd != null && d.plan_annual_usd > 0 ? d.plan_annual_usd : null;
}
export function planDescription(d: Device): string {
  if (d.category === "wearable") return d.brand === "Oura" ? "Membership required for detailed analysis" : "No subscription required for advertised core metrics";
  if (recordingStatus(d) === "no") return "Paid plan required for saved video; price may be unverified";
  if (recordingStatus(d) === "partial") return "Recording with conditions; optional plan price unverified";
  return "No subscription required for local recording; optional services may cost extra";
}
/** Incomplete totals stay unknown rather than substituting missing costs with zero. */
export function estimateCost(d: Device, years = 3): number | null {
  const price = d.device_price_assumption_usd;
  if (price == null) return null;
  // Camera/storage/installation requirements have no verified accessory prices.
  if (d.category !== "wearable") return null;
  if (d.brand === "RingConn") return price;
  const annual = planPrice(d);
  return annual == null ? null : price + annual * years;
}
export const freshness = { oldest: devices.map(d => d.reviewed).sort()[0], newest: devices.map(d => d.reviewed).sort().at(-1) };

export type DirectoryFilters = { q: string; cat: "all" | Device["category"]; free: boolean; offline: boolean; budget: number | undefined; sort: "name" | "cost" | "recent"; view: "grid" | "table" };
export function parseDirectoryFilters(s: Record<string, unknown>): DirectoryFilters {
  const budget = Number(s["budget"]);
  return { q: typeof s["q"] === "string" ? s["q"] : "", cat: s["cat"] === "doorbell" || s["cat"] === "camera" || s["cat"] === "wearable" ? s["cat"] : "all", free: s["free"] === true || s["free"] === "true", offline: s["offline"] === true || s["offline"] === "true", budget: s["budget"] !== undefined && Number.isFinite(budget) && budget >= 0 ? budget : undefined, sort: s["sort"] === "cost" || s["sort"] === "recent" ? s["sort"] : "name", view: s["view"] === "table" ? "table" : "grid" };
}
export function filterDevices(f: DirectoryFilters) {
  return devices.filter(d => (f.cat === "all" || d.category === f.cat) && name(d).toLowerCase().includes(f.q.toLowerCase()) && (!f.free || subscriptionFree(d)) && (!f.offline || (d.category !== "wearable" && status(d.record_without_internet) === "yes")) && (f.budget === undefined || (estimateCost(d) !== null && Number(estimateCost(d)) <= f.budget)))
    .sort((a, b) => f.sort === "recent" ? b.reviewed.localeCompare(a.reviewed) || name(a).localeCompare(name(b)) : f.sort === "cost" ? (estimateCost(a) ?? Infinity) - (estimateCost(b) ?? Infinity) || name(a).localeCompare(name(b)) : name(a).localeCompare(name(b)));
}
