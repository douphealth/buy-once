import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { devices, name, status, research, usd } from "@/lib/research";
import { StatusPill } from "@/components/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuyOnce — What your smart doorbell does after you cancel" },
      { name: "description", content: "Source-linked research on 21 doorbells, cameras and smart rings: what still works without a subscription, offline, and the true cost of ownership." },
      { property: "og:title", content: "BuyOnce — Ownership Desk" },
      { property: "og:description", content: "Flip the subscription switch on 21 real devices and see what you lose." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const doorbells = devices.filter((d) => d.category === "doorbell");

function Index() {
  const [slug, setSlug] = useState(doorbells[0].slug);
  const [active, setActive] = useState(false);
  const d = doorbells.find((x) => x.slug === slug)!;
  const rows = [
    { k: "Live view & answer", s: "yes" as const },
    { k: "Motion alerts", s: "yes" as const },
    { k: "Recorded video history", s: active ? ("yes" as const) : status(d.without_plan_recording) },
    { k: "Records without internet", s: status(d.record_without_internet) },
    { k: "Works if maker shuts down", s: status(d.vendor_independent) },
  ];
  const yearly = d.plan_annual_usd ?? (d.plan_monthly_usd ?? 0) * 12;

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-14 pb-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow animate-rise text-primary">Edition 04 · {research.count} devices · reviewed {research.updated}</p>
          <h1 className="font-display animate-rise mt-4 text-6xl leading-[0.9] md:text-8xl">
            What does it do <em className="text-primary">after</em> you stop paying?
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground">
            Smart devices are sold once and rented forever. We read every manufacturer's fine print so you can see, model by model, what survives a cancelled plan — with the source linked.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3">
            <Link to="/quiz" className="shadow-hard bg-primary px-5 py-3 font-medium text-primary-foreground transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">Find my doorbell →</Link>
            <Link to="/devices" className="border border-foreground px-5 py-3 font-medium transition-colors hover:bg-foreground hover:text-background">Browse all {research.count}</Link>
          </div>
        </div>

        <div className="shadow-hard-lg animate-rise border border-foreground bg-ink p-6 text-ink-foreground">
          <div className="flex items-center justify-between">
            <p className="eyebrow opacity-70">Cancellation simulator</p>
            <button onClick={() => setActive(!active)} role="switch" aria-checked={active} className="eyebrow flex items-center gap-2">
              <span className={cn("relative h-6 w-11 border border-ink-foreground transition-colors", active && "bg-citron")}>
                <span className={cn("absolute top-0.5 h-4 w-4 bg-ink-foreground transition-all", active ? "left-6 bg-ink" : "left-0.5")} />
              </span>
              Plan {active ? "active" : "cancelled"}
            </button>
          </div>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-4 w-full border border-ink-foreground/40 bg-transparent p-3 font-display text-3xl">
            {doorbells.map((x) => <option key={x.slug} value={x.slug} className="bg-ink text-base">{name(x)}</option>)}
          </select>
          <ul className="mt-5 divide-y divide-ink-foreground/15">
            {rows.map((r) => (
              <li key={r.k} className="flex items-center justify-between py-3">
                <span>{r.k}</span><StatusPill s={r.s} />
              </li>
            ))}
          </ul>
          <p key={slug + active} className="animate-rise mt-4 text-sm opacity-80">{active ? `Plan costs ${yearly ? usd(yearly) : "nothing"} a year.` : d.without_plan}</p>
          <Link to="/devices/$slug" params={{ slug }} className="eyebrow mt-5 inline-block text-citron underline-offset-4 hover:underline">Read the full file & sources →</Link>
        </div>
      </section>

      <div className="overflow-hidden border-y border-foreground bg-citron py-3 text-ink">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...devices, ...devices].map((x, i) => <span key={i} className="eyebrow">{name(x)} ✦</span>)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="eyebrow text-primary">Three independent tests</p>
        <h2 className="font-display mt-2 text-5xl">No single green tick.</h2>
        <div className="mt-10 grid gap-px border border-foreground bg-foreground md:grid-cols-3">
          {[
            ["01", "Subscription", "What still works when the plan lapses — recording, history, smart alerts."],
            ["02", "Internet", "Does it keep recording locally when the Wi-Fi drops?"],
            ["03", "Manufacturer", "Would it survive the company sunsetting its cloud? Rarely established."],
          ].map(([n, t, b]) => (
            <div key={n} className="group bg-background p-8 transition-colors hover:bg-primary hover:text-primary-foreground">
              <p className="font-mono text-sm opacity-60">{n}</p>
              <h3 className="font-display mt-6 text-4xl">{t}</h3>
              <p className="mt-3 opacity-80">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-6 md:grid-cols-4">
          {[[String(research.count), "devices researched"], ["15", "doorbells, 105 pairings"], ["0", "invented test results"], ["100%", "claims source-linked"]].map(([n, l]) => (
            <div key={l} className="border-t-4 border-foreground pt-4">
              <p className="font-display text-6xl">{n}</p><p className="eyebrow mt-1 text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
