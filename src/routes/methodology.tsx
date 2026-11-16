import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { research } from "@/lib/research";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — how BuyOnce researches devices" },
      { name: "description", content: "Documentation research, not lab testing. How we source, date and label every claim — and what we deliberately don't claim." },
      { property: "og:title", content: "BuyOnce methodology" },
      { property: "og:description", content: "Source-linked, dated, and honest about what's unknown." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Method,
});

const rules = [
  ["Model-level sources only", "Every status links to the maker's own support page, plan page or product listing for that exact model."],
  ["Dated", `Each file carries a review date. This edition: ${research.updated}. Terms change; the link lets you verify today.`],
  ["Unknown stays unknown", "If documentation doesn't establish a claim, it's labelled 'Not established' — never guessed green."],
  ["Prices are assumptions", "Device prices are editable illustrative figures or dated official snapshots, never live quotes."],
  ["No physical testing", "We read documentation. We don't claim lab tests, measurements or long-term reliability data."],
  ["No affiliate money", "No commissions, no sponsored rankings, no tracking scripts."],
];

function Method() {
  return (
    <>
      <PageHead kicker="Methodology" title="Credible because it admits what it doesn't know." />
      <div className="mx-auto grid max-w-7xl gap-px border border-foreground bg-foreground px-0 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(([t, b], i) => (
          <div key={t} className="bg-background p-8">
            <p className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="font-display mt-4 text-3xl">{t}</h2>
            <p className="mt-3 text-muted-foreground">{b}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-5 text-sm text-muted-foreground">Dataset licence: {research.license}</p>
    </>
  );
}
