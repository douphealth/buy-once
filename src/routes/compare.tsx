import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { devices, getDevice, name, deviceFacts, estimateCost, extrasNote, planDescription, planPrice, usd, categoryLabel } from "@/lib/research";
import { StatusPill, PageHead } from "@/components/site";
import { Evidence } from "@/components/evidence";
import { Button } from "@/components/ui/button";
import { AmazonPicks } from "@/components/AmazonPicks";
import { devicePicks } from "@/lib/picks";

type S = { a?: string | undefined; b?: string | undefined };
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): S => ({ a: typeof s["a"] === "string" ? s["a"] : undefined, b: typeof s["b"] === "string" ? s["b"] : undefined }),
  head: () => ({ meta: [
    { title: "Same-category ownership comparisons — BuyOnce" }, { name: "description", content: "Compare two doorbells, cameras or smart rings with differences first, evidence gaps and honest three-year estimates." },
    { property: "og:title", content: "Compare ownership, not just specifications — BuyOnce" }, { property: "og:description", content: "Same-category comparisons with visible conditions, manufacturer links and explicit unknown prices." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Compare,
});
function Compare() {
  const { a, b } = Route.useSearch();
  const nav = useNavigate({ from: "/compare" });
  const [differences, setDifferences] = useState(true);
  const A = getDevice(a ?? "") ?? devices[0];
  if (!A) return <PageHead kicker="Compare" title="No records available." />;
  const peers = devices.filter(d => d.category === A.category && d.slug !== A.slug);
  const requestedB = getDevice(b ?? "");
  const B = requestedB?.category === A.category && requestedB.slug !== A.slug ? requestedB : peers[0];
  if (!B) return <PageHead kicker="Compare" title="No same-category peer available." />;
  const pick = (key: "a" | "b") => <label className="min-w-0 text-xs text-muted-foreground">{key === "a" ? "First device" : "Second device"}<select aria-label={key === "a" ? "First device" : "Second device"} value={key === "a" ? A.slug : B.slug} onChange={e => { const chosen = getDevice(e.target.value); if (!chosen) return; const other = devices.find(d => d.category === chosen.category && d.slug !== chosen.slug); void nav({ search: key === "a" ? { a: chosen.slug, b: other?.slug } : { a: A.slug, b: chosen.slug }, replace: true }); }} className="mt-2 w-full min-w-0 border border-input bg-card p-3 text-sm text-foreground">{(key === "a" ? devices : peers).map(d => <option key={d.slug} value={d.slug}>{name(d)}</option>)}</select></label>;
  const factsA = deviceFacts(A), factsB = deviceFacts(B);
  const rows = factsA.map((fact, i) => ({ label: fact.label, same: fact.verdict === factsB[i]?.verdict && fact.detail === factsB[i]?.detail, cells: [A, B].map((d, j) => { const f = j === 0 ? fact : factsB[i]; return f ? <div><StatusPill s={f.verdict} /><p className="mt-3 text-sm">{f.detail}</p><Evidence device={d} fact={f} /></div> : null; }) }));
  const extraRows = [
    { label: "Required hardware", values: [extrasNote(A), extrasNote(B)] },
    { label: "Subscription requirements", values: [planDescription(A), planDescription(B)] },
    { label: "Annual paid/optional plan", values: [A, B].map(d => planPrice(d) === null ? "Price unverified" : `${usd(Number(planPrice(d)))}/year · imported record ${d.reviewed}`) },
    { label: "3-year estimated total", values: [A, B].map(d => estimateCost(d) === null ? "Incomplete — required costs unresolved" : `${usd(Number(estimateCost(d)))} · dated device price + membership, if applicable`) },
  ].map(r => ({ label: r.label, same: r.values[0] === r.values[1], cells: r.values.map(v => <p className="text-sm">{v}</p>) }));
  const allRows = [...rows, ...extraRows].sort((x, y) => Number(x.same) - Number(y.same));
  const visible = differences ? allRows.filter(r => !r.same) : allRows;
  return <><PageHead kicker={`Head to head · ${categoryLabel[A.category]}`} title="Compare what you actually own." />
    <div className="mx-auto max-w-6xl px-5"><div className="grid gap-4 sm:grid-cols-2">{pick("a")}{pick("b")}</div>
      {requestedB && requestedB.category !== A.category && <p role="status" className="mt-4 border-l-2 border-primary pl-3 text-sm">Your link mixed categories. Showing a {categoryLabel[A.category].toLowerCase()} peer instead.</p>}
      <div className="my-6 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={differences} onChange={e => setDifferences(e.target.checked)} className="accent-primary" />Differences only</label><p className="text-xs text-muted-foreground">{visible.length} rows · Unknown does not mean equivalent</p></div>
      <div className="overflow-x-auto border border-border"><table className="w-full min-w-[640px] bg-card text-left"><caption className="sr-only">Ownership comparison for {name(A)} and {name(B)}</caption><thead className="bg-secondary"><tr><th className="p-4 text-sm">Ownership facts</th>{[A, B].map(d => <th key={d.slug} className="w-[36%] p-4"><Link to="/devices/$slug" params={{ slug: d.slug }} className="font-display text-2xl text-primary">{name(d)}</Link></th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.label} className="border-t border-border"><th scope="row" className="p-4 align-top text-xs font-medium">{row.label}</th>{row.cells.map((cell, i) => <td key={i} className="border-l border-border p-4 align-top">{cell}</td>)}</tr>)}</tbody></table></div>
      <p className="mt-5 text-sm text-muted-foreground">Estimates use supplied, dated US prices, three annual memberships where applicable, no trial, taxes or shipping. Totals stay incomplete when device, plan or required hardware costs are unresolved. Claim-level excerpts and verification are still pending.</p><Button asChild variant="link" className="mt-4 px-0"><Link to="/devices" search={{ q: "", cat: "all", free: false, offline: false, budget: undefined, sort: "name", view: "grid" }}>← Back to directory</Link></Button>
    </div>
    <AmazonPicks title="Check current prices for both" intro="Prices change often, so we link to current listings rather than quoting a price." picks={[devicePicks(A)[0]!, devicePicks(B)[0]!].map((p, i) => ({ ...p, why: i === 0 ? `Current listings for the first device in this comparison.` : `Current listings for the second device in this comparison.` }))} />
    </>;
}
