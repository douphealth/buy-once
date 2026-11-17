import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { research, freshness } from "@/lib/research";
import { directorySearchDefaults, methodologyHead } from "@/lib/seo";

export const Route = createFileRoute("/methodology")({
  head: () => methodologyHead() as never,
  component: Method,
});

const rules = [
  ["Source scope", "Records include manufacturer support and product links. Some guidance is generic or from other regions. Individual claims are not yet mapped to supporting excerpts; links are not proof of a fresh verification."],
  ["Dated records, not new checks", `Imported record dates range from ${freshness.oldest} to ${freshness.newest}. Separate claim and plan-price verification dates were not supplied. We have not rechecked all sources today.`],
  ["Unknown stays unknown", "If the supplied documentation summary doesn't establish a claim, it is labelled 'Not verified'. Missing or unresearched prices are not treated as free."],
  ["Prices are assumptions", "Device prices are editable illustrative figures or dated official snapshots, never live quotes."],
  ["No physical testing", "We read documentation. We don't claim lab tests, measurements or long-term reliability data."],
  ["No affiliate money", "No commissions, no sponsored rankings, no tracking scripts."],
];

function Method() {
  return (
    <>
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: "Methodology" }]} kicker="Methodology" title="Credible because it admits what it doesn't know.">Documentation research, not lab testing. Records are dated and source-linked, and stay unverified when a claim is not established.</PageHead>
      <div className="mx-auto grid max-w-7xl gap-px border border-foreground bg-foreground px-0 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(([t, b], i) => (
          <div key={t} className="bg-background p-8">
            <p className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="font-display mt-4 text-3xl">{t}</h2>
            <p className="mt-3 text-muted-foreground">{b}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-5 text-sm text-muted-foreground">Dataset licence: {research.license} <Link to="/devices" search={directorySearchDefaults} className="text-primary underline-offset-4 hover:underline">Browse the device directory</Link>.</p>
      <section className="mx-auto mt-12 max-w-7xl border-t border-border px-5 pt-8">
        <h2 className="font-display text-3xl">Dataset field dictionary</h2>
        <dl className="mt-5 grid gap-5 text-sm md:grid-cols-2">
          <div><dt className="font-medium">without_plan / limitations</dt><dd className="mt-1 text-muted-foreground">Imported editorial summary and caveats, not verbatim manufacturer excerpts.</dd></div>
          <div><dt className="font-medium">source_urls / reviewed</dt><dd className="mt-1 text-muted-foreground">Device-level source links and supplied record date; not per-claim verification.</dd></div>
          <div><dt className="font-medium">plan_monthly_usd / plan_annual_usd</dt><dd className="mt-1 text-muted-foreground">Legacy zeros can mean an unresearched optional plan. The site treats them as unverified, not a $0 quote.</dd></div>
          <div><dt className="font-medium">device_price_assumption_usd</dt><dd className="mt-1 text-muted-foreground">Dated or illustrative hardware price. Null means unknown. Required hardware costs are not complete.</dd></div>
        </dl>
        <h2 className="font-display mt-10 text-3xl">Editorial status</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">This revision corrects display terminology, wearable attributes, camera recording sentinels and incomplete cost estimates. The downloaded source records remain unchanged. A named editorial owner, public corrections intake, licensed product photography and claim-by-claim source checks have not yet been provided; this is not a certified launch-ready research collection.</p>
      </section>
    </>
  );
}
