import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Camera, Circle, CreditCard, Fingerprint, Radio, ShieldCheck, WifiOff } from "lucide-react";
import { devices, name, status, research, usd } from "@/lib/research";
import { StatusPill } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import heroImage from "@/assets/ownership-still-life.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "BuyOnce — Smart devices. Real ownership." },
    { name: "description", content: "Explore source-linked research on 21 doorbells, cameras and smart rings. See what survives a cancelled subscription, with evidence gaps clearly marked." },
    { property: "og:title", content: "BuyOnce — Smart devices. Real ownership." },
    { property: "og:description", content: "What does your device do after you stop paying? Explore the Ownership Desk." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

const doorbells = devices.filter(d => d.category === "doorbell");
const directorySearch = { q: "", cat: "all", free: false, offline: false, budget: undefined, sort: "name", view: "grid" } as const;
const principles = [
  { n: "01", title: "No plan.", subtitle: "Still your device?", Icon: CreditCard, copy: "Recording, history, smart alerts. What remains when the subscription ends — and what disappears." },
  { n: "02", title: "No internet.", subtitle: "Still recording?", Icon: WifiOff, copy: "Local storage isn't the whole story. We separate offline recording from simply having an SD card." },
  { n: "03", title: "No manufacturer.", subtitle: "Still useful?", Icon: Fingerprint, copy: "Cloud services can disappear. Long-term independence is a separate question, and often unverified." },
];

function Index() {
  const root = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState(doorbells[0]?.slug ?? "");
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    root.current?.querySelectorAll(".home-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const d = doorbells.find(x => x.slug === slug) ?? doorbells[0];
  if (!d) return <p className="p-5">No doorbell records available.</p>;
  const rows = [
    { k: "Live view & answer", s: /live viewing|answer|live view/i.test(d.without_plan + d.limitations) ? "partial" as const : "unknown" as const },
    { k: "Motion alerts", s: "unknown" as const },
    { k: "Recorded video history", s: active ? "yes" as const : status(d.without_plan_recording) },
    { k: "Records without internet", s: status(d.record_without_internet) },
    { k: "Works if maker shuts down", s: status(d.vendor_independent) },
  ];
  const yearly = d.plan_annual_usd && d.plan_annual_usd > 0 ? d.plan_annual_usd : null;
  return <div ref={root} className="ownership-home" data-ready={ready}>
    <section className="home-hero relative isolate overflow-hidden bg-home-stage">
      <img src={heroImage} alt="Illustrative unbranded video doorbell, security camera and titanium smart ring" width={1920} height={1088} fetchPriority="high" className="home-hero-image absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="home-hero-inner relative mx-auto flex max-w-7xl flex-col justify-center px-5">
        <p className="eyebrow animate-rise flex items-center gap-2 text-primary"><span className="home-live-dot" /> Independent ownership research · Edition 04</p>
        <h1 className="home-wordmark font-display animate-rise mt-5">BuyOnce<span className="text-primary">.</span></h1>
        <p className="home-hero-title font-display animate-rise mt-3">Smart devices.<br /> <em className="text-primary">Real ownership.</em></p>
        <p className="animate-rise mt-5 max-w-sm text-base leading-relaxed text-home-subtle">What does it do <span className="font-medium text-foreground">after you stop paying?</span><br />Find out before you buy in.</p>
        <div className="animate-rise mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-5"><Link to="/devices" search={directorySearch}>Explore the directory <ArrowUpRight /></Link></Button>
          <Button asChild variant="outline" size="lg" className="h-12 border-foreground/30 bg-transparent px-5"><Link to="/quiz">Find my doorbell <ArrowRight /></Link></Button>
        </div>
        <div className="animate-rise mt-7 flex items-center gap-2 text-xs text-home-subtle"><ShieldCheck className="size-4 text-primary" /> Source-linked. No affiliate links. No physical tests.</div>
      </div>
      <div className="home-image-label absolute bottom-5 right-5 flex items-center gap-2 text-home-subtle"><span className="h-px w-6 bg-home-subtle/50" /><span className="eyebrow">Illustrative category imagery</span></div>
      <a href="#ownership-check" className="home-scroll absolute bottom-5 left-5 flex items-center gap-3 text-xs text-home-subtle" aria-label="Explore the ownership check"><ArrowDown className="size-4" /> The ownership check</a>
      <div className="home-object-tag home-object-tag-one absolute hidden items-center gap-2 border border-foreground/20 bg-background/85 px-3 py-2 text-xs backdrop-blur md:flex"><Radio className="size-3.5 text-primary" /> Hardware is only half the story.</div>
    </section>

    <div className="border-y border-foreground/20 bg-citron text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <p className="eyebrow flex items-center gap-2"><Circle className="size-3" /> Buy it. Don't rent its potential.</p>
        <p className="eyebrow">{research.count} devices · 3 categories · Evidence over promises</p>
      </div>
    </div>

    <section id="ownership-check" className="home-reveal mx-auto max-w-7xl scroll-mt-24 px-5 py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:pt-6">
          <p className="eyebrow text-primary">01 / The cancellation question</p>
          <h2 className="font-display mt-5 text-5xl leading-[1.05] md:text-6xl">Cancel the plan.<br /><em className="text-primary">Keep what?</em></h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">The box says smart. The fine print says subscription. Look beyond the purchase price and see what your doorbell actually keeps.</p>
          <div className="mt-8 flex items-center gap-3 border-t border-foreground/20 pt-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary"><ArrowRight className="size-4" /></span><p className="max-w-xs text-sm text-muted-foreground">Manufacturer-documentation summaries. Conditions and unknowns stay visible.</p></div>
          <Button asChild variant="link" className="mt-5 px-0"><Link to="/methodology">Behind the research <ArrowUpRight /></Link></Button>
        </div>
        <div className="home-simulator relative overflow-hidden rounded-lg border border-ink bg-ink p-5 text-ink-foreground sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-foreground/20 pb-5">
            <p className="eyebrow flex items-center gap-2"><span className="home-live-dot bg-citron" /> Cancellation simulator</p>
            <label className="flex cursor-pointer items-center gap-3 text-xs" htmlFor="plan-switch"><span>Plan {active ? "active" : "cancelled"}</span><Switch id="plan-switch" checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-citron data-[state=unchecked]:bg-ink-foreground/25" /></label>
          </div>
          <label htmlFor="doorbell-model" className="eyebrow mt-6 block text-ink-foreground/60">Your device</label>
          <select id="doorbell-model" value={slug} onChange={e => setSlug(e.target.value)} className="mt-2 w-full min-w-0 border-b border-ink-foreground/30 bg-ink pb-3 pr-5 font-display text-2xl sm:text-3xl">{doorbells.map(x => <option key={x.slug} value={x.slug} className="text-base">{name(x)}</option>)}</select>
          <ul className="mt-3 divide-y divide-ink-foreground/15">{rows.map(r => <li key={r.k} className="flex min-h-14 items-center justify-between gap-3 py-3 text-sm"><span>{r.k}</span><span className="shrink-0"><StatusPill s={r.s} /></span></li>)}</ul>
          <div aria-live="polite" className="mt-4 min-h-24 border-l-2 border-citron pl-4"><p key={slug + active} className="animate-rise text-xs leading-relaxed text-ink-foreground/75">{active ? yearly === null ? "Paid/optional plan price unverified. Confirm included recording features with the manufacturer." : `Imported plan price: ${usd(yearly)} a year; not a live quote.` : d.without_plan}</p></div>
          <Button asChild variant="link" className="mt-3 h-auto px-0 text-citron"><Link to="/devices/$slug" params={{ slug }}>Read the full file & sources <ArrowUpRight /></Link></Button>
        </div>
      </div>
    </section>

    <section className="border-y border-foreground/15 bg-background/90 py-20">
      <div className="home-reveal mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow text-primary">02 / Three separate questions</p><h2 className="font-display mt-4 text-5xl md:text-6xl">Ownership isn't a checkbox.</h2></div><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">A device can pass one question and fail another. We keep them separate.</p></div>
        <div className="mt-12 grid md:grid-cols-3">{principles.map(({ n, title, subtitle, Icon, copy }) => <div key={n} className="home-principle group relative border-t border-foreground/25 py-8 md:px-7 md:first:pl-0 md:last:pr-0"><div className="flex items-center justify-between"><span className="eyebrow text-muted-foreground">/ {n}</span><Icon className="size-6 text-primary transition-transform duration-500 group-hover:-rotate-12" /></div><h3 className="font-display mt-8 text-4xl">{title}</h3><p className="font-display mt-1 text-3xl italic text-primary">{subtitle}</p><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy}</p></div>)}</div>
      </div>
    </section>

    <section className="home-reveal mx-auto max-w-7xl px-5 py-20">
      <p className="eyebrow text-primary">03 / Find your category</p>
      <div className="mt-5 grid gap-5 md:grid-cols-3">{([{ cat: "doorbell", title: "At your door", type: "Doorbells", Icon: Radio }, { cat: "camera", title: "Around your home", type: "Cameras", Icon: Camera }, { cat: "wearable", title: "On your finger", type: "Smart rings", Icon: Circle }] as const).map(({ cat, title, type, Icon }) => <Link key={cat} to="/devices" search={{ ...directorySearch, cat }} className="home-category group rounded-md border border-foreground/20 bg-card p-6 transition-colors hover:border-primary hover:bg-accent/20"><div className="flex items-center justify-between"><Icon className="size-7 text-primary" /><ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="eyebrow mt-8 text-muted-foreground">{type} · {devices.filter(x => x.category === cat).length} records</p><h3 className="font-display mt-2 text-3xl">{title}</h3></Link>)}</div>
    </section>

    <section className="home-reveal bg-primary py-14 text-primary-foreground"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-4">{[[String(research.count), "imported device records"], [String(doorbells.length), "doorbell records"], ["0", "physical tests performed"], [String(devices.filter(x => x.source_urls.length > 0).length), "records with source links"]].map(([n, label]) => <div key={label} className="border-t border-primary-foreground/30 pt-4"><p className="font-display text-6xl">{n}<span className="text-citron">.</span></p><p className="eyebrow mt-3 opacity-80">{label}</p></div>)}</div></section>
    <div className="home-marquee overflow-hidden border-b border-foreground/20 bg-background py-5"><div className="animate-marquee flex w-max items-center gap-10">{[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-10">{[...new Set(devices.map(x => x.brand))].map(brand => <span key={brand} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl text-muted-foreground">{brand}<span className="text-primary">✳</span></span>)}</div>)}</div></div>
  </div>;
}
