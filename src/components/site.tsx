import { Link } from "@tanstack/react-router";
import { type Status, statusLabel, freshness } from "@/lib/research";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/devices", label: "Directory" },
  { to: "/compare", label: "Compare" },
  { to: "/quiz", label: "Quiz" },
  { to: "/calculator", label: "Cost lab" },
  { to: "/methodology", label: "Method" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none">BuyOnce</span>
          <span className="eyebrow hidden text-muted-foreground sm:inline">Ownership Desk · Ed.04</span>
        </Link>
        <nav aria-label="Main navigation" className="flex max-w-full gap-1 overflow-x-auto text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="px-3 py-1.5 transition-colors hover:bg-foreground hover:text-background" activeProps={{ className: "bg-foreground text-background" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-4xl">BuyOnce</p>
          <p className="mt-2 max-w-xs text-sm opacity-70">Independent reading of manufacturer documentation. No device was physically tested. Terms change — always check the linked source.</p>
        </div>
        <div className="eyebrow space-y-2 opacity-80">
          <p>US research edition</p><p>Record dates: {freshness.oldest} – {freshness.newest}</p><p>Claim-level verification pending</p><p>No affiliate links · No tracking</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a className="underline-offset-4 hover:underline" href="/data/buyonce-research.json" download>Download JSON dataset</a>
          <a className="underline-offset-4 hover:underline" href="/data/buyonce-research.csv" download>Download CSV dataset</a>
          <Link to="/methodology" className="underline-offset-4 hover:underline">How we research</Link>
        </div>
      </div>
    </footer>
  );
}

const tone: Record<Status, string> = {
  yes: "bg-citron text-ink",
  partial: "bg-caution text-ink",
  no: "bg-warn text-ink",
  unknown: "bg-muted text-muted-foreground border border-dashed border-foreground/40",
};
const glyph: Record<Status, string> = { yes: "●", partial: "◐", no: "○", unknown: "?" };

export function StatusPill({ s, label }: { s: Status; label?: string | undefined }) {
  return <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 text-xs", tone[s])}><span aria-hidden="true">{glyph[s]}</span>{label ? `${label}: ` : ""}{statusLabel[s]}</span>;
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-14 pb-8">
      <p className="eyebrow animate-rise text-primary">{kicker}</p>
      <h1 className="font-display animate-rise mt-3 max-w-4xl text-5xl leading-[0.95] md:text-7xl">{title}</h1>
      {children && <div className="animate-rise mt-5 max-w-2xl text-lg text-muted-foreground">{children}</div>}
    </section>
  );
}
