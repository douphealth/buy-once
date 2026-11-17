import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getDevice, name, categoryLabel, usd, devices, deviceFacts, extrasNote, planDescription, planPrice, estimateCost } from "@/lib/research";
import { StatusPill } from "@/components/site";
import { Evidence } from "@/components/evidence";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/devices/$slug")({
  loader: ({ params }) => { const d = getDevice(params.slug); if (!d) throw notFound(); return d; },
  head: ({ loaderData: d }) => d ? ({
    meta: [
      { title: `${name(d)} without a subscription — BuyOnce` },
      { name: "description", content: d.without_plan.slice(0, 155) },
      { property: "og:title", content: `${name(d)}: what works without a plan` },
      { property: "og:description", content: d.without_plan.slice(0, 155) },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }) : { meta: [{ title: "Unavailable — BuyOnce" }, { name: "robots", content: "noindex" }] },
  component: DevicePage,
});

function DevicePage() {
  const d = Route.useLoaderData();
  const peers = devices.filter((x) => x.category === d.category && x.slug !== d.slug).slice(0, 3);
  return (
    <article className="mx-auto max-w-5xl px-5 pt-12">
      <Link to="/devices" search={{}} className="eyebrow text-muted-foreground hover:text-primary">← Directory</Link>
      <p className="eyebrow mt-8 text-primary">{categoryLabel[d.category]} · {d.market} · imported record dated {d.reviewed}</p>
      <h1 className="font-display animate-rise mt-3 text-6xl leading-[0.95] md:text-8xl">{name(d)}</h1>
      <blockquote className="animate-rise mt-8 border-l-4 border-primary pl-5 text-xl">{d.without_plan}</blockquote>

      <p className="mt-4 text-sm text-muted-foreground">Documentation summary only. Claim-level verification, supporting excerpts and a named reviewer were not supplied.</p>
      <div className="mt-10 grid gap-px border border-foreground bg-foreground sm:grid-cols-3">
        {deviceFacts(d).map((fact) => (
          <div key={fact.key} className="bg-card p-5">
            <p className="eyebrow text-muted-foreground">{fact.label}</p>
            <div className="mt-3"><StatusPill s={fact.verdict} /></div>
            <p className="mt-2 text-sm text-muted-foreground">{fact.detail}</p>
            <Evidence device={d} fact={fact} />
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Money</h2>
          <dl className="mt-4 divide-y divide-border font-mono text-sm">
            <Row k="Device (dated / illustrative)" v={d.device_price_assumption_usd != null ? usd(d.device_price_assumption_usd) : "Price unverified"} />
            <Row k="Paid / optional plan monthly" v={d.plan_monthly_usd ? `$${d.plan_monthly_usd}` : "Price unverified"} />
            <Row k="Paid / optional plan annual" v={planPrice(d) !== null ? `$${planPrice(d)}` : "Price unverified"} />
            <Row k="3-year estimated total" v={estimateCost(d) === null ? "Incomplete" : usd(Number(estimateCost(d)))} />
            <Row k="Price status" v={d.price_source_status} />
          </dl>
          <p className="mt-4 text-sm">{planDescription(d)}</p>
          <p className="mt-3 text-sm text-muted-foreground">Required extras: {extrasNote(d)}</p>
          <p className="mt-3 text-xs text-muted-foreground">US prices, not live quotes. Three-year estimates include annual membership where applicable, exclude trial, taxes and shipping, and remain incomplete when required costs are unresolved.</p>
          <Button asChild className="mt-5"><Link to="/calculator" search={{ d: d.slug }}>Enter your own cost assumptions →</Link></Button>
        </div>
        <div>
          <h2 className="font-display text-3xl">Limitations</h2>
          <p className="mt-4 text-muted-foreground">{d.limitations}</p>
          <h2 className="font-display mt-8 text-3xl">Sources</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {d.source_urls.map((u, i) => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="break-all text-primary underline-offset-4 hover:underline">[{i + 1}] {new URL(u).hostname}{new URL(u).pathname.slice(0, 50)}</a></li>)}
          </ol>
        </div>
      </div>

      {peers.length > 0 && (
        <section className="mt-16 border-t border-foreground pt-8">
          <p className="eyebrow">Compare with</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {peers.map((p) => <Link key={p.slug} to="/compare" search={{ a: d.slug, b: p.slug }} className="border border-foreground px-4 py-2 hover:bg-foreground hover:text-background">vs {name(p)}</Link>)}
          </div>
        </section>
      )}
    </article>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between gap-4 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
