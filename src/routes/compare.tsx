import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { devices, getDevice, name, status, usd, type Device } from "@/lib/research";
import { StatusPill, PageHead } from "@/components/site";

type S = { a?: string; b?: string };
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): S => ({ a: typeof s.a === "string" ? s.a : undefined, b: typeof s.b === "string" ? s.b : undefined }),
  head: () => ({
    meta: [
      { title: "Compare two devices side by side — BuyOnce" },
      { name: "description", content: "Head-to-head: subscription dependence, offline recording and 5-year cost for any two researched devices." },
      { property: "og:title", content: "Compare devices — BuyOnce" },
      { property: "og:description", content: "Side-by-side ownership comparison of smart doorbells, cameras and rings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compare,
});

const fiveYear = (d: Device) => (d.device_price_assumption_usd ?? 0) + (d.plan_annual_usd ?? 0) * 5;

function Compare() {
  const { a = devices[0].slug, b = devices[3].slug } = Route.useSearch();
  const nav = useNavigate({ from: "/compare" });
  const A = getDevice(a) ?? devices[0], B = getDevice(b) ?? devices[3];
  const pick = (k: "a" | "b") => (
    <select value={k === "a" ? A.slug : B.slug} onChange={(e) => nav({ search: (p) => ({ ...p, [k]: e.target.value }), replace: true })} className="w-full border border-foreground bg-card p-3 font-display text-2xl">
      {devices.map((d) => <option key={d.slug} value={d.slug} disabled={d.slug === (k === "a" ? B.slug : A.slug)}>{name(d)}</option>)}
    </select>
  );
  const max = Math.max(fiveYear(A), fiveYear(B), 1);
  const rows: [string, (d: Device) => React.ReactNode][] = [
    ["Recording without plan", (d) => <StatusPill s={d.without_plan_recording === "not applicable" ? "yes" : status(d.without_plan_recording)} />],
    ["Recording without internet", (d) => <StatusPill s={status(d.record_without_internet)} />],
    ["Vendor independent", (d) => <StatusPill s={status(d.vendor_independent)} />],
    ["Annual plan", (d) => <span className="font-mono">{d.plan_annual_usd ? usd(d.plan_annual_usd) : "—"}</span>],
    ["5-year cost (illustrative)", (d) => (
      <div><span className="font-mono">{usd(fiveYear(d))}</span>
        <div className="mt-2 h-2 bg-muted"><div className="h-full bg-primary transition-all duration-700" style={{ width: `${(fiveYear(d) / max) * 100}%` }} /></div></div>)],
  ];
  return (
    <>
      <PageHead kicker="Head to head" title="Two devices. One honest table." />
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">{pick("a")}<span className="font-display text-3xl">vs</span>{pick("b")}</div>
        <div className="mt-8 border border-foreground bg-card">
          {rows.map(([k, f]) => (
            <div key={k} className="grid grid-cols-1 border-b border-border last:border-0 md:grid-cols-[220px_1fr_1fr]">
              <div className="eyebrow bg-secondary p-4">{k}</div>
              <div className="p-4">{f(A)}</div><div className="p-4 md:border-l md:border-border">{f(B)}</div>
            </div>
          ))}
          <div className="grid md:grid-cols-[220px_1fr_1fr]">
            <div className="eyebrow bg-secondary p-4">Without a plan</div>
            <p className="p-4 text-sm">{A.without_plan}</p><p className="p-4 text-sm md:border-l md:border-border">{B.without_plan}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Device prices are editable assumptions, not live quotes. Cross-category comparisons (ring vs doorbell) are not like-for-like.</p>
      </div>
    </>
  );
}
