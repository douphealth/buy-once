// Site-wide SEO settings used by src/lib/seo-edge.ts, /sitemap.xml and /llms.txt.
export type SeoPage = { path: string; title: string; section?: string; desc?: string; lastmod?: string };
import { devices, name } from "@/lib/research";

export const SEO = {
  origin: "https://buyonce.site",
  pagesDevHost: "buy-once.pages.dev",
  name: "BuyOnce",
  description: "Source-linked research on smart doorbells, security cameras and smart rings: what still works without a subscription, total cost of ownership and evidence gaps.",
  lang: "en",
  logo: "/favicon.png" as string | undefined,
  sameAs: [] as string[],
  sectionNames: {} as Record<string, string>,
  keepTrailingSlash: false,
};

export const LLMS_NOTES: string[] = [
  "Raw research data: https://buyonce.site/data/buyonce-research.csv",
  "Each device page marks which claims are verified, partly verified or unknown."
];

export function seoPages(): SeoPage[] {
  return [
    { path: "/", title: "BuyOnce — Smart devices. Real ownership.", section: "Start here" },
    { path: "/devices", title: "All researched devices", section: "Start here" },
    { path: "/compare", title: "Compare devices", section: "Tools" },
    { path: "/calculator", title: "Subscription cost calculator", section: "Tools" },
    { path: "/quiz", title: "Which device fits you? Quiz", section: "Tools" },
    { path: "/methodology", title: "Methodology", section: "About the data" },
    ...devices.map((d) => ({ path: `/devices/${d.slug}`, title: `${name(d)} — what works without a subscription`, section: "Devices" })),
  ];
}
