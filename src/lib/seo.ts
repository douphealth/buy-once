import { defaultStringifySearch } from "@tanstack/react-router";
import {
  devices,
  filterDevices,
  freshness,
  name,
  parseDirectoryFilters,
  research,
  type Device,
  type DirectoryFilters,
} from "@/lib/research";

/**
 * Production origin for every absolute URL (canonical, Open Graph, sitemap, llms.txt).
 * Override at build time with VITE_SITE_URL so the server and the browser stay in agreement.
 */
const configuredSiteUrl = (import.meta.env as unknown as { VITE_SITE_URL?: string }).VITE_SITE_URL;
export const SITE_URL = (configuredSiteUrl?.trim() || "https://buyonce.site").replace(/\/+$/, "");

export const directorySearchDefaults: DirectoryFilters = {
  q: "",
  cat: "all",
  free: false,
  offline: false,
  budget: undefined,
  sort: "name",
  view: "grid",
};

export const OG_IMAGE_PATH = "/og.png";
export const LOGO_PATH = "/logo.png";
const OG_ALT = "BuyOnce. Smart devices. Real ownership.";
const ORG_DESCRIPTION =
  "Independent reading of manufacturer documentation. No device was physically tested.";

export function absoluteUrl(path: string): string {
  if (path.startsWith("https://") || path.startsWith("http://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 60) return clean;
  return `${clean.slice(0, 59).trimEnd()}…`;
}

export function metaDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  let cut = clean.slice(0, 159);
  const space = cut.lastIndexOf(" ");
  if (space >= 120) cut = cut.slice(0, space);
  return `${cut.trimEnd()}…`;
}

export function isDefaultDirectory(filters: DirectoryFilters): boolean {
  return (
    filters.q === "" &&
    filters.cat === "all" &&
    !filters.free &&
    !filters.offline &&
    filters.budget === undefined &&
    filters.sort === "name" &&
    filters.view === "grid"
  );
}

export function directoryPath(filters: DirectoryFilters): string {
  const search: Partial<DirectoryFilters> = {};
  if (filters.q) search.q = filters.q;
  if (filters.cat !== "all") search.cat = filters.cat;
  if (filters.free) search.free = true;
  if (filters.offline) search.offline = true;
  if (filters.budget !== undefined) search.budget = filters.budget;
  if (filters.sort !== "name") search.sort = filters.sort;
  if (filters.view !== "grid") search.view = filters.view;
  return `/devices${defaultStringifySearch(search)}`;
}

export function comparePath(a?: string, b?: string): string {
  const search: { a?: string; b?: string } = {};
  if (a) search.a = a;
  if (b) search.b = b;
  return `/compare${defaultStringifySearch(search)}`;
}

export function calculatorPath(device?: string): string {
  return `/calculator${defaultStringifySearch(device ? { d: device } : {})}`;
}

export function deviceTitle(device: Device): string {
  const detailed = `${name(device)} without a plan — BuyOnce`;
  return pageTitle(detailed.length <= 60 ? detailed : `${name(device)} — BuyOnce`);
}

export function deviceDescription(device: Device): string {
  return metaDescription(device.without_plan);
}

type JsonLd = Record<string, unknown>;

export function seoHead(opts: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  robots?: "index, follow" | "noindex, follow";
  jsonLd?: JsonLd | JsonLd[];
}) {
  const title = pageTitle(opts.title);
  const description = metaDescription(opts.description);
  const url = absoluteUrl(opts.path);
  const image = absoluteUrl(OG_IMAGE_PATH);
  const graphs = opts.jsonLd ? (Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd]) : [];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: opts.robots ?? "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: opts.ogType ?? "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_ALT },
      { property: "og:site_name", content: "BuyOnce" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: OG_ALT },
      ...graphs.map((data) => ({ "script:ld+json": data })),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const HOME_TITLE = "BuyOnce — Smart devices. Real ownership.";
export const HOME_DESCRIPTION =
  "Source-linked records of what doorbells, cameras and smart rings still do after a subscription ends, with evidence gaps left visible.";

export function homeJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "BuyOnce",
        url: absoluteUrl("/"),
        logo: absoluteUrl(LOGO_PATH),
        description: ORG_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        name: "BuyOnce",
        url: absoluteUrl("/"),
        description: ORG_DESCRIPTION,
      },
    ],
  };
}

export function homeHead() {
  return seoHead({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    jsonLd: homeJsonLd(),
  });
}

export const DIRECTORY_TITLE = "Device ownership directory — BuyOnce";
export const DIRECTORY_DESCRIPTION = `Compare subscription requirements, local storage and ownership costs for ${research.count} devices, with manufacturer links and evidence gaps.`;

export function directoryHead(search: DirectoryFilters | Record<string, unknown>) {
  const filters = parseDirectoryFilters(search as Record<string, unknown>);
  const path = directoryPath(filters);
  const visible = filterDevices(filters);
  return seoHead({
    title: DIRECTORY_TITLE,
    description: DIRECTORY_DESCRIPTION,
    path,
    robots: isDefaultDirectory(filters) ? "index, follow" : "noindex, follow",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Directory", path },
      ]),
      ...(visible.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Smart device ownership directory",
              numberOfItems: visible.length,
              itemListElement: visible.map((device, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: name(device),
                url: absoluteUrl(`/devices/${device.slug}`),
              })),
            },
          ]
        : []),
    ],
  });
}

export function deviceJsonLd(device: Device): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: name(device),
    description: device.without_plan,
    dateModified: device.reviewed,
    mainEntityOfPage: absoluteUrl(`/devices/${device.slug}`),
    publisher: { "@type": "Organization", name: "BuyOnce", url: absoluteUrl("/") },
  };
}

export function deviceHead(device: Device | undefined) {
  if (!device) {
    return seoHead({
      title: "Unavailable — BuyOnce",
      description: "That device record is not in the BuyOnce dataset.",
      path: "/devices",
      robots: "noindex, follow",
    });
  }
  const path = `/devices/${device.slug}`;
  return seoHead({
    title: deviceTitle(device),
    description: deviceDescription(device),
    path,
    ogType: "article",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Directory", path: "/devices" },
        { name: name(device), path },
      ]),
      deviceJsonLd(device),
    ],
  });
}

export const METHODOLOGY_TITLE = "Research methodology — BuyOnce";
export const METHODOLOGY_DESCRIPTION =
  "Documentation research, not lab testing. Records are dated and source-linked, and stay unverified when a claim is not established.";

export function methodologyHead() {
  return seoHead({
    title: METHODOLOGY_TITLE,
    description: METHODOLOGY_DESCRIPTION,
    path: "/methodology",
    ogType: "article",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Methodology", path: "/methodology" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Credible because it admits what it doesn't know.",
        description: METHODOLOGY_DESCRIPTION,
        dateModified: research.updated,
        mainEntityOfPage: absoluteUrl("/methodology"),
        publisher: { "@type": "Organization", name: "BuyOnce", url: absoluteUrl("/") },
      },
    ],
  });
}

export const QUIZ_TITLE = "Doorbell finder quiz — BuyOnce";
export const QUIZ_DESCRIPTION =
  "Four questions, transparent hard filters, no hidden ranking. Find doorbells that match how you want to own them.";

export function quizHead() {
  return seoHead({
    title: QUIZ_TITLE,
    description: QUIZ_DESCRIPTION,
    path: "/quiz",
    jsonLd: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Doorbell finder", path: "/quiz" },
    ]),
  });
}

export const CALCULATOR_TITLE = "Ownership cost lab — BuyOnce";
export const CALCULATOR_DESCRIPTION =
  "Estimate a multi-year total from device price, plan, trial months and extras. The total stays hidden until you confirm the assumptions.";

export function calculatorHead(device?: string) {
  const path = calculatorPath(device);
  return seoHead({
    title: CALCULATOR_TITLE,
    description: CALCULATOR_DESCRIPTION,
    path,
    robots: device ? "noindex, follow" : "index, follow",
    jsonLd: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Cost lab", path },
    ]),
  });
}

export const COMPARE_TITLE = "Compare device ownership — BuyOnce";
export const COMPARE_DESCRIPTION =
  "Compare two doorbells, cameras or smart rings in the same category, with differences, evidence gaps and incomplete prices left visible.";

export function compareHead(a?: string, b?: string) {
  const path = comparePath(a, b);
  return seoHead({
    title: COMPARE_TITLE,
    description: COMPARE_DESCRIPTION,
    path,
    robots: a || b ? "noindex, follow" : "index, follow",
    jsonLd: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Compare", path },
    ]),
  });
}

export type SitemapEntry = { loc: string; lastmod?: string };

export function indexableEntries(): SitemapEntry[] {
  const updated = research.updated;
  return [
    { loc: absoluteUrl("/"), lastmod: updated },
    { loc: absoluteUrl("/devices"), lastmod: updated },
    ...devices.map((device) => ({
      loc: absoluteUrl(`/devices/${device.slug}`),
      lastmod: device.reviewed,
    })),
    { loc: absoluteUrl("/methodology"), lastmod: updated },
    { loc: absoluteUrl("/quiz"), lastmod: updated },
    { loc: absoluteUrl("/calculator"), lastmod: updated },
    { loc: absoluteUrl("/compare"), lastmod: updated },
  ];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sitemapXml(): string {
  const body = indexableEntries()
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "Twitterbot",
  "facebookexternalhit",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

export function robotsTxt(): string {
  const groups = CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n");
  return `${groups}\n\nUser-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}

export function llmsTxt(): string {
  const pages = [
    `- [Home](${absoluteUrl("/")}): What the research covers`,
    `- [Directory](${absoluteUrl("/devices")}): All ${research.count} device records`,
    `- [Methodology](${absoluteUrl("/methodology")}): How records are sourced and what is not claimed`,
    `- [Doorbell finder](${absoluteUrl("/quiz")}): Four hard-filter questions for doorbells`,
    `- [Cost lab](${absoluteUrl("/calculator")}): Multi-year cost from your own assumptions`,
    `- [Compare](${absoluteUrl("/compare")}): Same-category documentation comparison`,
  ];
  const records = devices.map(
    (device) =>
      `- [${name(device)}](${absoluteUrl(`/devices/${device.slug}`)}): ${device.without_plan}`,
  );
  return [
    "# BuyOnce",
    "",
    "> Independent reading of manufacturer documentation for smart doorbells, cameras and smart rings. Records what still works after a subscription ends. No physical testing. No affiliate links.",
    "",
    `BuyOnce publishes ${research.count} imported device records for the ${research.market} market. Record dates run from ${freshness.oldest} to ${freshness.newest}. Prices are dated or illustrative, not live quotes. Claims the documentation does not establish stay unverified.`,
    "",
    "## Pages",
    "",
    ...pages,
    "",
    "## Device records",
    "",
    ...records,
    "",
  ].join("\n");
}
