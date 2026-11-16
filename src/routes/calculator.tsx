import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { devices, getDevice, name, ownershipCost, usd } from "@/lib/research";
import { PageHead } from "@/components/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calculator")({
  validateSearch: (s: Record<string, unknown>): { d?: string | undefined } => ({ d: typeof s["d"] === "string" ? s["d"] : undefined }),
  head: () => ({
    meta: [
      { title: "Ownership cost lab — BuyOnce" },
      { name: "description", content: "Calculate the true multi-year cost of a smart doorbell, camera or ring including subscriptions, trials and accessories." },
      { property: "og:title", content: "Ownership cost lab — BuyOnce" },
      { property: "og:description", content: "The sticker price is the down payment. See the real total." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calc,
});

function Calc() {
  const { d: initial } = Route.useSearch();
  const [slug, setSlug] = useState(initial ?? devices[0]!.slug);
  const dev = getDevice(slug) ?? devices[0]!;
  const [price, setPrice] = useState(dev.device_price_assumption_usd ?? 0);
  const [billing, setBilling] = useState<"monthly" | "annual" | "none">("annual");
  const [years, setYears] = useState(5);
  const [trial, setTrial] = useState(0);
  const [extras, setExtras] = useState(0);
  const [owned, setOwned] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setPrice(dev.device_price_assumption_usd ?? 0), [dev.slug]);
  const base = { price, monthly: dev.plan_monthly_usd ?? 0, annual: dev.plan_annual_usd ?? 0, billing, trialMonths: trial, extras, owned };
  const r = ownershipCost({ ...base, years });
  const timeline = Array.from({ length: 10 }, (_, i) => ownershipCost({ ...base, years: i + 1 }).total);
  const max = Math.max(...timeline, 1);
  const summary = `${name(dev)} over ${years} years: ${usd(r.total)} (hardware ${usd(r.hardware)}, plan ${usd(r.plan)}, extras ${usd(r.extras)}). via BuyOnce`;

  return (
    <>
      <PageHead kicker="Cost lab" title="The sticker price is just the down payment." />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5 border border-foreground bg-card p-6">
          <Field label="Device"><select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-input bg-background p-2">{devices.map((d) => <option key={d.slug} value={d.slug}>{name(d)}</option>)}</select></Field>
          <Field label={`Device price · ${usd(price)}`}><input type="range" min={0} max={600} step={5} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-primary" /></Field>
          <Field label="Plan billing">
            <div className="grid grid-cols-3 border border-foreground">{(["monthly", "annual", "none"] as const).map((b) => <button key={b} onClick={() => setBilling(b)} className={cn("eyebrow py-2", billing === b && "bg-foreground text-background")}>{b}</button>)}</div>
          </Field>
          <Field label={`Horizon · ${years} years`}><input type="range" min={1} max={10} value={years} onChange={(e) => setYears(+e.target.value)} className="w-full accent-primary" /></Field>
          <details className="border-t border-border pt-4">
            <summary className="eyebrow cursor-pointer">Advanced</summary>
            <div className="mt-4 space-y-4">
              <Field label="Free trial months"><input type="number" min={0} value={trial} onChange={(e) => setTrial(Math.max(0, +e.target.value))} className="w-full border border-input bg-background p-2" /></Field>
              <Field label="Accessories & fees ($)"><input type="number" min={0} value={extras} onChange={(e) => setExtras(Math.max(0, +e.target.value))} className="w-full border border-input bg-background p-2" /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={owned} onChange={(e) => setOwned(e.target.checked)} className="accent-primary" />I already own it</label>
            </div>
          </details>
        </div>

        <div className="shadow-hard-lg border border-foreground bg-ink p-8 text-ink-foreground">
          <p className="eyebrow opacity-70">{name(dev)} · {years}-year total</p>
          <p key={r.total} className="font-display animate-rise mt-2 text-8xl leading-none">{usd(r.total)}</p>
          <div className="mt-6 flex h-4 overflow-hidden">
            <div className="bg-citron transition-all duration-500" style={{ width: `${(r.hardware / (r.total || 1)) * 100}%` }} />
            <div className="bg-primary transition-all duration-500" style={{ width: `${(r.plan / (r.total || 1)) * 100}%` }} />
            <div className="bg-warn transition-all duration-500" style={{ width: `${(r.extras / (r.total || 1)) * 100}%` }} />
          </div>
          <div className="eyebrow mt-3 flex flex-wrap gap-5 opacity-80"><span>■ Hardware {usd(r.hardware)}</span><span>■ Plan {usd(r.plan)}</span><span>■ Extras {usd(r.extras)}</span></div>
          {r.plan > r.hardware && r.hardware > 0 && <p className="mt-5 text-citron">The subscription now costs more than the device itself.</p>}
          <p className="eyebrow mt-10 opacity-70">Cumulative cost, years 1–10</p>
          <div className="mt-3 flex h-40 items-end gap-2">
            {timeline.map((t, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className={cn("w-full transition-all duration-500", i < years ? "bg-citron" : "bg-ink-foreground/20")} style={{ height: `${(t / max) * 100}%` }} title={usd(t)} />
                <span className="font-mono text-xs opacity-60">{i + 1}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="eyebrow mt-8 border border-ink-foreground px-4 py-2 hover:bg-ink-foreground hover:text-ink">{copied ? "Copied ✓" : "Copy summary"}</button>
        </div>
      </div>
    </>
  );
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="eyebrow mb-2 block text-muted-foreground">{label}</span>{children}</label>;
