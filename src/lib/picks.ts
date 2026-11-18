import type { Pick } from "@/components/AmazonPicks";
import { extrasNote, name } from "@/lib/research";

type D = Parameters<typeof name>[0] & { category: string };
const ALT: Record<string, Pick> = {
  doorbell: { label: "Other no-subscription doorbells", query: "video doorbell local storage no subscription", why: "Compare any alternative against the table above before buying." },
  camera: { label: "Other no-subscription cameras", query: "security camera local storage no subscription", why: "Compare any alternative against the table above before buying." },
  wearable: { label: "Other smart rings", query: "smart ring no subscription", why: "Check what each ring shows without a membership before buying." },
};

/** Exact-model search first, then what the device record says you will also need, then alternatives. */
export function devicePicks(d: D): Pick[] {
  const picks: Pick[] = [{ label: name(d), query: name(d), why: "Search Amazon for this exact model. Check the bundle includes the extras listed above." }];
  if (/microSD|storage/i.test(extrasNote(d))) picks.push({ label: "High-endurance microSD card", query: "high endurance microSD card", why: "Made for continuous video recording. Check the maximum card size this device supports." });
  if (ALT[d.category]) picks.push(ALT[d.category]!);
  return picks;
}
