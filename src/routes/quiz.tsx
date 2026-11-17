import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { devices, name, status, usd, type Device, subscriptionFree, planPrice } from "@/lib/research";
import { PageHead, StatusPill } from "@/components/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Doorbell finder quiz — BuyOnce" },
      { name: "description", content: "Four questions, transparent hard filters, no hidden ranking. Find doorbells that match how you want to own them." },
      { property: "og:title", content: "Doorbell finder — BuyOnce" },
      { property: "og:description", content: "Four honest questions to find a doorbell you won't have to rent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quiz,
});

type Q = { q: string; opts: { l: string; f: (d: Device) => boolean }[] };
const qs: Q[] = [
  { q: "Must it save video without a subscription?", opts: [{ l: "Yes, non-negotiable", f: (d) => status(d.without_plan_recording) === "yes" }, { l: "Partial is fine", f: (d) => status(d.without_plan_recording) !== "no" }, { l: "I'll pay for a plan", f: () => true }] },
  { q: "Should it record when the internet is down?", opts: [{ l: "Yes", f: (d) => status(d.record_without_internet) === "yes" }, { l: "Don't mind", f: () => true }] },
  { q: "Yearly plan budget?", opts: [{ l: "$0", f: subscriptionFree }, { l: "Up to $50", f: (d) => subscriptionFree(d) || (planPrice(d) !== null && Number(planPrice(d)) <= 50) }, { l: "Any", f: () => true }] },
  { q: "Device budget?", opts: [{ l: "Under $100", f: (d) => d.device_price_assumption_usd !== null && d.device_price_assumption_usd < 100 }, { l: "Under $200", f: (d) => d.device_price_assumption_usd !== null && d.device_price_assumption_usd < 200 }, { l: "Any", f: () => true }] },
];

function Quiz() {
  const [ans, setAns] = useState<number[]>([]);
  const step = ans.length;
  const pool = devices.filter((d) => d.category === "doorbell");
  const result = pool.filter((d) => ans.every((a, i) => qs[i]?.opts[a]?.f(d) === true));
  const current = qs[step];
  return (
    <>
      <PageHead kicker="Doorbell finder · doorbells only" title="Four questions. Zero hidden scoring.">Every filter is a hard rule you can see. If nothing matches, we say so.</PageHead>
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex gap-1">{qs.map((_, i) => <div key={i} className={cn("h-1.5 flex-1 transition-colors", i < step ? "bg-primary" : "bg-muted")} />)}</div>
        {current ? (
          <div key={step} className="animate-rise mt-8">
            <p className="eyebrow text-muted-foreground">Question {step + 1} / {qs.length} · {result.length} still match</p>
            <h2 className="font-display mt-3 text-5xl">{current.q}</h2>
            <div className="mt-8 grid gap-3">
              {current.opts.map((o, i) => (
                <button key={o.l} onClick={() => setAns([...ans, i])} className="border border-foreground bg-card p-5 text-left text-lg transition-all hover:translate-x-1 hover:bg-primary hover:text-primary-foreground">{o.l} →</button>
              ))}
            </div>
            {step > 0 && <button onClick={() => setAns(ans.slice(0, -1))} className="eyebrow mt-6 text-muted-foreground">← Back</button>}
          </div>
        ) : (
          <div className="animate-rise mt-8">
            <h2 className="font-display text-5xl">{result.length ? `${result.length} match${result.length > 1 ? "es" : ""}` : "Nothing passes every filter."}</h2>
            {!result.length && <p className="mt-3 text-muted-foreground">That's an honest answer — relax one requirement and try again.</p>}
            <div className="mt-6 grid gap-4">
              {result.map((d) => (
                <Link key={d.slug} to="/devices/$slug" params={{ slug: d.slug }} className="flex flex-wrap items-center justify-between gap-3 border border-foreground bg-card p-5 hover:shadow-hard">
                  <span className="font-display text-2xl">{name(d)}</span>
                  <span className="flex flex-wrap items-center gap-3"><StatusPill s={status(d.without_plan_recording)} label="Recording without plan" /><span className="font-mono text-sm">{planPrice(d) !== null ? `${usd(Number(planPrice(d)))}/yr` : "Optional/paid plan price unverified"}</span></span>
                </Link>
              ))}
            </div>
            <button onClick={() => setAns([])} className="shadow-hard mt-8 bg-primary px-5 py-3 text-primary-foreground">Start over</button>
          </div>
        )}
      </div>
    </>
  );
}
