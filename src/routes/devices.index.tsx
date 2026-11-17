import { createFileRoute, Link, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Grid2X2, List, SlidersHorizontal, X, Plus, Check, ImageOff } from "lucide-react";
import { devices, name, categoryLabel, usd, type Device, type DirectoryFilters, parseDirectoryFilters, filterDevices, deviceFacts, extrasNote, planDescription, planPrice, estimateCost, freshness } from "@/lib/research";
import { StatusPill, PageHead } from "@/components/site";
import { Evidence } from "@/components/evidence";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export const Route = createFileRoute("/devices/")({
  validateSearch: parseDirectoryFilters,
  // Default filters stay out of the URL so /devices answers 200 at its canonical address.
  search: { middlewares: [stripSearchParams({ q: "", cat: "all", free: false, offline: false, sort: "name", view: "grid" })] },
  head: () => ({ meta: [
    { title: "Smart device ownership directory — BuyOnce" },
    { name: "description", content: "Compare subscription requirements, local storage and ownership costs for 21 devices, with manufacturer links and explicit evidence gaps." },
    { property: "og:title", content: "Smart device ownership directory — BuyOnce" },
    { property: "og:description", content: "What still works when you stop paying? Category-specific facts, costs and documentation records." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Directory,
});

function Directory() {
  const f = Route.useSearch();
  const navigate = useNavigate({ from: "/devices/" });
  const [selected, setSelected] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const list = filterDevices(f);
  const update = (patch: Partial<DirectoryFilters>) => { void navigate({ search: prev => ({ ...prev, ...patch }), replace: true }); };
  const reset = () => { void navigate({ search: parseDirectoryFilters({}), replace: true }); };
  const selectedDevices = selected.flatMap(slug => devices.filter(d => d.slug === slug));
  const selectedCategory = selectedDevices[0]?.category;
  const toggle = (d: Device) => setSelected(prev => prev.includes(d.slug) ? prev.filter(s => s !== d.slug) : prev.length < 2 && (!selectedCategory || selectedCategory === d.category) ? [...prev, d.slug] : prev);
  const filterControls = <div className="flex flex-wrap items-end gap-5">
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-primary" checked={f.free} onChange={e => update({ free: e.target.checked })} /><span>Works without a subscription<span className="mt-1 block max-w-64 text-xs text-muted-foreground">Full local recording, or advertised core ring metrics. Hardware conditions still apply.</span></span></label>
    {f.cat !== "wearable" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={f.offline} onChange={e => update({ offline: e.target.checked })} />Records without internet</label>}
    <label className="text-xs text-muted-foreground">3-year total budget (USD)<input aria-label="3-year total budget (USD)" type="number" min="0" value={f.budget ?? ""} onChange={e => update({ budget: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Any" className="mt-1 block w-32 border border-input bg-card p-2 text-sm text-foreground" /></label>
    <Button variant="ghost" onClick={reset}>Reset filters</Button>
  </div>;
  const active = [f.q && { label: `Search: ${f.q}`, clear: () => update({ q: "" }) }, f.cat !== "all" && { label: categoryLabel[f.cat], clear: () => update({ cat: "all" }) }, f.free && { label: "Without subscription", clear: () => update({ free: false }) }, f.offline && { label: "Offline recording", clear: () => update({ offline: false }) }, f.budget !== undefined && { label: `Budget: ${usd(f.budget)}`, clear: () => update({ budget: undefined }) }].filter(x => !!x);
  return <>
    <PageHead kicker={`Ownership directory · ${devices.length} records`} title="What still works when you stop paying?">Compare subscription requirements, local storage, and ownership costs—with manufacturer sources.</PageHead>
    <div data-directory-ready={ready} className="mx-auto max-w-7xl px-5 pb-12">
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border pb-5 text-xs text-muted-foreground"><span>United States · USD only</span><span>Record dates {freshness.oldest} – {freshness.newest}</span><span>No physical testing · Claim verification pending</span></div>
      <div className="flex flex-wrap items-center gap-3 py-5">
        <input aria-label="Search brand or model" value={f.q} onChange={e => update({ q: e.target.value })} placeholder="Search brand or exact model…" className="min-w-0 basis-full border border-input bg-card p-3 sm:flex-1 sm:basis-auto" />
        <div className="flex max-w-full flex-wrap gap-1" role="group" aria-label="Device category">{(["all", "doorbell", "camera", "wearable"] as const).map(cat => <Button key={cat} variant={f.cat === cat ? "default" : "outline"} aria-pressed={f.cat === cat} onClick={() => update({ cat, offline: cat === "wearable" ? false : f.offline })}>{cat === "all" ? "All devices" : categoryLabel[cat]}</Button>)}</div>
        <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal />Filters</Button>
      </div>
      <div className="hidden border-y border-border py-5 lg:block">{filterControls}</div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}><SheetContent className="w-full overflow-y-auto"><SheetHeader><SheetTitle>Filter devices</SheetTitle><SheetDescription>United States · USD. Incomplete totals are excluded from budget matches.</SheetDescription></SheetHeader><div className="mt-8">{filterControls}</div><Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>Show {list.length} results</Button></SheetContent></Sheet>
      {active.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{active.map(chip => chip && <Button key={chip.label} variant="secondary" size="sm" onClick={chip.clear}>{chip.label}<X /></Button>)}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 py-5"><p className="text-sm" aria-live="polite">{list.length} results</p><div className="flex items-center gap-3"><label className="sr-only" htmlFor="sort">Sort devices</label><select id="sort" value={f.sort} onChange={e => update({ sort: e.target.value as DirectoryFilters["sort"] })} className="max-w-48 border border-input bg-card p-2 text-sm"><option value="name">Name A–Z</option><option value="cost">3-year cost (known first)</option><option value="recent">Record date (newest first)</option></select><div className="flex" role="group" aria-label="Directory view"><Button size="icon" variant={f.view === "grid" ? "default" : "outline"} aria-label="Grid view" title="Grid view" aria-pressed={f.view === "grid"} onClick={() => update({ view: "grid" })}><Grid2X2 /></Button><Button size="icon" variant={f.view === "table" ? "default" : "outline"} aria-label="Table view" title="Table view" aria-pressed={f.view === "table"} onClick={() => update({ view: "table" })}><List /></Button></div></div></div>
      {f.budget !== undefined && <p className="mb-5 border-l-2 border-primary pl-3 text-sm text-muted-foreground">Budget results exclude missing prices and unpriced required hardware. Estimates are not live quotes; taxes and shipping are excluded.</p>}
      {!list.length ? <section className="border-y border-border py-16 text-center"><h2 className="font-display text-4xl">No documented match.</h2><p className="mx-auto mt-3 max-w-lg text-muted-foreground">Try removing the total budget or offline requirement. Unverified costs and capabilities cannot pass those filters.</p><Button variant="outline" className="mt-6" onClick={reset}>Reset filters</Button></section> : f.view === "table" ? <div className="overflow-x-auto border border-border"><table className="w-full min-w-[760px] bg-card text-left text-sm"><caption className="sr-only">Device ownership specifications</caption><thead className="bg-secondary"><tr>{["Device", "Without a subscription", "Plan", "3-year estimate", "Compare"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{list.map(d => <tr key={d.slug} className="border-t border-border"><td className="p-4"><Link to="/devices/$slug" params={{ slug: d.slug }} className="font-medium text-primary underline">{name(d)}</Link><div className="mt-2"><Evidence device={d} /></div></td><td className="max-w-xs p-4">{d.without_plan}</td><td className="max-w-52 p-4">{planDescription(d)}<p className="mt-1 text-xs text-muted-foreground">{planPrice(d) === null ? "Optional/paid plan price unverified" : `${usd(Number(planPrice(d)))}/year · record ${d.reviewed}`}</p></td><td className="p-4">{estimateCost(d) === null ? "Incomplete" : usd(Number(estimateCost(d)))}</td><td className="p-4"><CompareButton d={d} selected={selected.includes(d.slug)} disabled={!selected.includes(d.slug) && (selected.length === 2 || !!selectedCategory && selectedCategory !== d.category)} toggle={toggle} /></td></tr>)}</tbody></table></div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{list.map(d => <article key={d.slug} className="flex min-w-0 flex-col border border-border bg-card transition-shadow hover:shadow-hard">
        <div className="flex h-24 items-center justify-between border-b border-border bg-secondary/50 px-5"><span className="eyebrow text-muted-foreground">{categoryLabel[d.category]}</span><div className="flex items-center gap-2 text-xs text-muted-foreground"><ImageOff className="size-4" />Product photo not supplied</div></div>
        <div className="flex flex-1 flex-col p-5"><p className="eyebrow text-muted-foreground">{d.brand}</p><h2 className="font-display mt-1 text-3xl leading-tight"><Link to="/devices/$slug" params={{ slug: d.slug }} className="hover:text-primary">{d.model}</Link></h2><p className="mt-4 text-sm font-medium leading-relaxed">{d.without_plan}</p>
          <dl className="mt-5 divide-y divide-border">{deviceFacts(d).map(fact => <div key={fact.key} className="py-3"><dt className="mb-2 text-xs font-medium">{fact.label}</dt><dd><StatusPill s={fact.verdict} /><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{fact.detail}</p><Evidence device={d} fact={fact} /></dd></div>)}</dl>
          <p className="mt-4 text-xs"><strong>Required extras:</strong> {extrasNote(d)}</p>
          <div className="mt-5 border-t border-border pt-4 text-sm"><p>{planDescription(d)}</p><p className="mt-1 text-xs text-muted-foreground">{planPrice(d) === null ? "Optional/paid plan price unverified" : `${usd(Number(planPrice(d)))}/year · imported record ${d.reviewed}`}</p><div className="mt-4 flex flex-wrap justify-between gap-3"><div><p className="text-xs text-muted-foreground">Device · USD</p><p className="font-mono">{d.device_price_assumption_usd === null ? "Price unverified" : usd(d.device_price_assumption_usd)}</p></div><div><p className="text-xs text-muted-foreground">3-year estimate</p><p className="font-mono">{estimateCost(d) === null ? "Incomplete" : usd(Number(estimateCost(d)))}</p></div></div><p className="mt-2 text-xs text-muted-foreground">{d.price_source_status}. Record {d.reviewed}. {estimateCost(d) === null ? "Total unavailable: price, plan or required extras unresolved." : "Device + 3 annual memberships where applicable; no trial, taxes or shipping."}</p></div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5"><Evidence device={d} /><CompareButton d={d} selected={selected.includes(d.slug)} disabled={!selected.includes(d.slug) && (selected.length === 2 || !!selectedCategory && selectedCategory !== d.category)} toggle={toggle} /></div>
        </div>
      </article>)}</div>}
    </div>
    {selected.length > 0 && <aside aria-label="Compare tray" className="sticky bottom-0 z-30 border-t border-foreground bg-background shadow-hard"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-4"><p className="text-sm font-medium">Compare {selected.length}/2 · {selectedCategory && categoryLabel[selectedCategory]}</p>{selectedDevices.map(d => <Button key={d.slug} variant="secondary" size="sm" className="max-w-full whitespace-normal" onClick={() => toggle(d)}>{name(d)}<X /></Button>)}{selectedDevices[0] && selectedDevices[1] ? <Button asChild className="sm:ml-auto"><Link to="/compare" search={{ a: selectedDevices[0].slug, b: selectedDevices[1].slug }}>Compare devices →</Link></Button> : <p className="text-xs text-muted-foreground">Choose another {selectedCategory && categoryLabel[selectedCategory].toLowerCase()}.</p>}<Button variant="ghost" size="icon" title="Clear comparison" aria-label="Clear comparison" onClick={() => setSelected([])}><X /></Button></div></aside>}
  </>;
}
function CompareButton({ d, selected, disabled, toggle }: { d: Device; selected: boolean; disabled: boolean; toggle: (d: Device) => void }) {
  return <Button variant={selected ? "secondary" : "outline"} size="sm" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Add"} ${name(d)} ${selected ? "from" : "to"} compare`} disabled={disabled} title={disabled ? "Choose two devices in the same category" : undefined} onClick={() => toggle(d)}>{selected ? <Check /> : <Plus />}{selected ? "Selected" : "Compare"}</Button>;
}
