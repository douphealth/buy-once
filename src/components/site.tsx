import { Link } from "@tanstack/react-router";
import { type Status, statusLabel, freshness } from "@/lib/research";
import { directorySearchDefaults } from "@/lib/seo";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

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
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoMark} alt="BuyOnce logo" width={256} height={256} className="h-9 w-9 shadow-hard" />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-3xl leading-none">BuyOnce</span>
            <span className="eyebrow hidden text-muted-foreground sm:inline">Ownership Desk · Ed.04</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex max-w-full gap-1 overflow-x-auto text-sm">
          {nav.map((n) =>
            n.to === "/devices" ? (
              <Link key={n.to} to="/devices" search={directorySearchDefaults} className="shrink-0 whitespace-nowrap px-3 py-1.5 transition-colors hover:bg-foreground hover:text-background" activeProps={{ className: "bg-foreground text-background" }}>
                {n.label}
              </Link>
            ) : (
              <Link key={n.to} to={n.to} className="shrink-0 whitespace-nowrap px-3 py-1.5 transition-colors hover:bg-foreground hover:text-background" activeProps={{ className: "bg-foreground text-background" }}>
                {n.label}
              </Link>
            ),
          )}
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
          <img src={logoMark} alt="BuyOnce logo" width={256} height={256} loading="lazy" className="h-12 w-12" />
          <p className="font-display mt-3 text-4xl">BuyOnce</p>
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

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className={last ? "text-foreground" : undefined}>{item.label}</span>
              ) : (
                <CrumbLink href={item.href}>{item.label}</CrumbLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "underline-offset-4 hover:text-primary hover:underline";
  if (href === "/") return <Link to="/" className={className}>{children}</Link>;
  if (href === "/devices") return <Link to="/devices" search={directorySearchDefaults} className={className}>{children}</Link>;
  if (href === "/methodology") return <Link to="/methodology" className={className}>{children}</Link>;
  if (href === "/quiz") return <Link to="/quiz" className={className}>{children}</Link>;
  if (href === "/calculator") return <Link to="/calculator" className={className}>{children}</Link>;
  if (href === "/compare") return <Link to="/compare" className={className}>{children}</Link>;
  return <a href={href} className={className}>{children}</a>;
}

export function PageHead({ kicker, title, crumbs, children }: { kicker: string; title: string; crumbs?: { label: string; href?: string }[]; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-14 pb-8">
      {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
      <p className="eyebrow animate-rise text-primary">{kicker}</p>
      <h1 className="font-display animate-rise mt-3 max-w-4xl text-5xl leading-[0.95] md:text-7xl">{title}</h1>
      {children && <div className="animate-rise mt-5 max-w-2xl text-lg text-muted-foreground">{children}</div>}
    </section>
  );
}
