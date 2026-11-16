import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getDevice, name, status, categoryLabel, usd, devices } from "@/lib/research";
import { StatusPill } from "@/components/site";

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
      <Link to="/devices" className="eyebrow text-muted-foreground hover:text-primary">← Directory</Link>
      <p className="eyebrow mt-8 text-primary">{categoryLabel[d.category]} · {d.market} · reviewed {d.reviewed}</p>
      <h1 className="font-display animate-rise mt-3 text-6xl leading-[0.95] md:text-8xl">{name(d)}</h1>
      <blockquote className="animate-rise mt-8 border-l-4 border-primary pl-5 text-xl">{d.without_plan}</blockquote>

      <div className="mt-10 grid gap-px border border-foreground bg-foreground sm:grid-cols-3">
        {([["Recording without plan", d.without_plan_recording], ["Recording without internet", d.record_without_internet], ["Vendor independent", d.vendor_independent]] as [string, string][]).map(([k, v]) => (
          <div key={k} className="bg-card p-5">
            <p className="eyebrow text-muted-foreground">{k}</p>
            <div className="mt-3"><StatusPill s={v === "not applicable" ? "yes" : status(v)} label={v === "not applicable" ? "Not required" : undefined} /></div>
            {v.length > 20 && <p className="mt-2 text-sm text-muted-foreground">{v}</p>}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Money</h2>
          <dl className="mt-4 divide-y divide-border font-mono text-sm">
            <Row k="Device (assumption)" v={d.device_price_assumption_usd ? usd(d.device_price_assumption_usd) : "—"} />
            <Row k="Plan monthly" v={d.plan_monthly_usd ? `$${d.plan_monthly_usd}` : "—"} />
            <Row k="Plan annual" v={d.plan_annual_usd ? `$${d.plan_annual_usd}` : "—"} />
            <Row k="Price status" v={d.price_source_status} />
          </dl>
          <Link to="/calculator" search={{ d: d.slug }} className="shadow-hard mt-5 inline-block bg-primary px-4 py-2 text-primary-foreground">Run 5-year cost →</Link>
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
