import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { devices, name, status, categoryLabel, usd, type Device } from "@/lib/research";
import { StatusPill, PageHead } from "@/components/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/devices/")({
  head: () => ({
    meta: [
      { title: "Device directory — BuyOnce" },
      { name: "description", content: "Filter 21 doorbells, cameras and smart rings by no-plan recording, offline recording and subscription price." },
      { property: "og:title", content: "Device directory — BuyOnce" },
      { property: "og:description", content: "Filter 21 smart devices by what works without a subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Directory,
});


type Sort = "name" | "plan" | "price";
function Directory() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | Device["category"]>("all");
  const [noPlan, setNoPlan] = useState(false);
  const [sort, setSort] = useState<Sort>("name");
  const list = useMemo(() => devices
    .filter((d) => cat === "all" || d.category === cat)
    .filter((d) => !noPlan || status(d.without_plan_recording) === "yes" || d.without_plan_recording === "not applicable")
    .filter((d) => name(d).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "name" ? name(a).localeCompare(name(b)) : sort === "plan" ? (a.plan_annual_usd ?? 0) - (b.plan_annual_usd ?? 0) : (a.device_price_assumption_usd ?? 0) - (b.device_price_assumption_usd ?? 0)), [q, cat, noPlan, sort]);

  return (
    <>
      <PageHead kicker="Research directory" title="Every device, every caveat.">Each file is model-specific and links straight to the maker's own documentation.</PageHead>
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-center gap-3 border-y border-foreground py-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand or model…" className="min-w-56 flex-1 border border-foreground bg-card px-3 py-2" />
          {(["all", "doorbell", "camera", "wearable"] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("eyebrow border border-foreground px-3 py-2", cat === c && "bg-foreground text-background")}>{c === "all" ? "All" : categoryLabel[c]}</button>
          ))}
          <label className="eyebrow flex items-center gap-2"><input type="checkbox" checked={noPlan} onChange={(e) => setNoPlan(e.target.checked)} className="accent-primary" />Records free</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="eyebrow border border-foreground bg-card px-2 py-2">
            <option value="name">A–Z</option><option value="plan">Cheapest plan</option><option value="price">Cheapest device</option>
          </select>
        </div>
        <p className="eyebrow mt-4 text-muted-foreground">{list.length} results</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <Link key={d.slug} to="/devices/$slug" params={{ slug: d.slug }} style={{ animationDelay: `${i * 30}ms` }}
              className="animate-rise group border border-foreground bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-hard-lg">
              <p className="eyebrow text-muted-foreground">{categoryLabel[d.category]} · {d.brand}</p>
              <h2 className="font-display mt-2 text-3xl leading-tight group-hover:text-primary">{d.model}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill s={d.without_plan_recording === "not applicable" ? "yes" : status(d.without_plan_recording)} label={`No-plan rec.`} />
                <StatusPill s={status(d.record_without_internet)} label="Offline" />
              </div>
              <p className="mt-4 font-mono text-sm">{d.plan_annual_usd ? `${usd(d.plan_annual_usd)}/yr plan` : "No plan priced"}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
