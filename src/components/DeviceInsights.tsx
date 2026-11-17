import { Link } from "@tanstack/react-router";
import { categoryLabel, deviceFacts, devices, estimateCost, extrasNote, name, usd } from "@/lib/research";

/** Answer-first summary, category comparison and FAQ derived from the research dataset only. */
type D = (typeof devices)[number];
const V: Record<string, string> = { yes: "Yes", partial: "Partly", no: "No", unknown: "Not verified" };
const Q: Record<string, (n: string) => string> = {
  offline: (n) => `Can the ${n} record without internet?`,
  retention: (n) => `How long does the ${n} keep recordings without a plan?`,
  history: (n) => `Can I see history and export data from the ${n} without a membership?`,
  account: (n) => `Does the ${n} depend on the vendor's app and account?`,
};
const cost = (d: D) => { const c = estimateCost(d); return c === null ? "Incomplete" : usd(Number(c)); };

export function DeviceInsights({ d }: { d: D }) {
  const facts = deviceFacts(d);
  const lead = facts[0]!;
  const peers = devices.filter((x) => x.category === d.category);
  const label = categoryLabel[d.category as keyof typeof categoryLabel] ?? d.category;
  const answer = `${V[lead.verdict] ?? "Not verified"}${lead.verdict === "unknown" ? "" : "."} ${d.without_plan} ${facts.slice(1).map((f) => `${f.label}: ${(V[f.verdict] ?? "not verified").toLowerCase()}.`).join(" ")} Estimated 3-year cost: ${cost(d).toLowerCase() === "incomplete" ? "incomplete because some required costs are unverified" : cost(d)}.`;
  const faq = [
    { q: `Does the ${name(d)} work without a subscription?`, a: d.without_plan },
    ...facts.slice(1).map((f) => ({ q: (Q[f.key] ?? ((n: string) => `${f.label}: what does the ${n} support?`))(name(d)), a: `${V[f.verdict] ?? "Not verified"}. ${f.detail}` })),
    { q: `How much does the ${name(d)} cost over 3 years?`, a: estimateCost(d) === null ? `The 3-year estimate is incomplete because some required costs are unverified. Use the BuyOnce calculator with your own prices.` : `About ${cost(d)} in US prices, including any annual membership where applicable and excluding taxes and shipping.` },
    { q: `What else do I need to buy for the ${name(d)}?`, a: extrasNote(d) },
    { q: `What are the ${name(d)}'s limitations?`, a: d.limitations },
  ];
  const ld = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }).replace(/</g, "\u003c");
  return (
    <>
      <section className="mt-10 border border-foreground bg-card p-6"><p className="eyebrow text-primary">Short answer</p><p className="mt-3 text-lg leading-relaxed">{answer}</p></section>
      {peers.length > 1 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">{label}s compared without a subscription</h2>
          <div className="mt-4 overflow-x-auto border border-foreground"><table className="w-full text-sm"><thead><tr className="text-left font-mono text-xs uppercase text-muted-foreground"><th className="p-3">Device</th>{facts.map((f) => <th key={f.key} className="p-3">{f.label}</th>)}<th className="p-3">3-year cost</th></tr></thead>
            <tbody>{peers.map((p) => { const pf = deviceFacts(p); return <tr key={p.slug} className={`border-t border-border ${p.slug === d.slug ? "bg-muted/60" : ""}`}><td className="p-3 font-medium">{p.slug === d.slug ? name(p) : <Link to="/devices/$slug" params={{ slug: p.slug }} className="text-primary hover:underline">{name(p)}</Link>}</td>{facts.map((f) => <td key={f.key} className="p-3">{V[pf.find((x) => x.key === f.key)?.verdict ?? "unknown"]}</td>)}<td className="p-3 font-mono">{cost(p)}</td></tr>; })}</tbody></table></div>
        </section>
      )}
      <section className="mt-16">
        <h2 className="font-display text-3xl">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-border border border-foreground">{faq.map((x) => <div key={x.q} className="p-5"><h3 className="font-semibold">{x.q}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{x.a}</p></div>)}</div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      </section>
    </>
  );
}
