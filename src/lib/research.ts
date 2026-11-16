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
export const statusLabel: Record<Status, string> = { yes: "Documented", partial: "Conditional", no: "Lost", unknown: "Not established" };

/** Total cost of ownership over `years`. */
export function ownershipCost(o: { price: number; monthly: number; annual: number; billing: "monthly" | "annual" | "none"; years: number; trialMonths?: number; extras?: number; owned?: boolean }) {
  const months = Math.max(0, Math.round(o.years * 12) - (o.trialMonths ?? 0));
  const plan = o.billing === "none" ? 0 : o.billing === "monthly" ? o.monthly * months : o.annual * (months / 12);
  const hardware = o.owned ? 0 : o.price;
  return { hardware, plan, extras: o.extras ?? 0, total: hardware + plan + (o.extras ?? 0) };
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
