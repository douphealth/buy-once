import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { devices, filterDevices, name, parseDirectoryFilters } from "./research";
import {
  CALCULATOR_DESCRIPTION,
  CALCULATOR_TITLE,
  COMPARE_DESCRIPTION,
  COMPARE_TITLE,
  DIRECTORY_DESCRIPTION,
  DIRECTORY_TITLE,
  HOME_DESCRIPTION,
  HOME_TITLE,
  METHODOLOGY_DESCRIPTION,
  METHODOLOGY_TITLE,
  QUIZ_DESCRIPTION,
  QUIZ_TITLE,
  SITE_URL,
  calculatorHead,
  compareHead,
  deviceDescription,
  deviceHead,
  deviceTitle,
  directoryHead,
  directoryPath,
  homeHead,
  indexableEntries,
  llmsTxt,
  methodologyHead,
  quizHead,
  robotsTxt,
  sitemapXml,
} from "./seo";

function titleOf(head: { meta: Array<Record<string, unknown>> }) {
  const item = head.meta.find((entry) => "title" in entry);
  return String(item?.["title"] ?? "");
}
function metaContent(head: { meta: Array<Record<string, unknown>> }, key: string) {
  const item = head.meta.find((entry) => entry["name"] === key || entry["property"] === key);
  return String(item?.["content"] ?? "");
}
function jsonLd(head: { meta: Array<Record<string, unknown>> }) {
  return head.meta.filter((item) => "script:ld+json" in item).map((item) => item["script:ld+json"]);
}

describe("site origin and on-page metadata", () => {
  it("uses the production origin unless VITE_SITE_URL is set", () => {
    expect(SITE_URL).toBe("https://buyonce.site");
  });

  it("keeps every indexable title and description within limits and unique", () => {
    const heads = [
      homeHead(),
      directoryHead({}),
      methodologyHead(),
      quizHead(),
      calculatorHead(),
      compareHead(),
      ...devices.map((device) => deviceHead(device)),
    ];
    const titles = heads.map(titleOf);
    const descriptions = heads.map((head) => metaContent(head, "description"));
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const title of titles) expect(title.length).toBeLessThanOrEqual(60);
    for (const description of descriptions) expect(description.length).toBeLessThanOrEqual(160);
    expect(titles).toContain(HOME_TITLE);
    expect(descriptions).toContain(HOME_DESCRIPTION);
    expect(DIRECTORY_TITLE.length).toBeLessThanOrEqual(60);
    expect(DIRECTORY_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(METHODOLOGY_TITLE.length).toBeLessThanOrEqual(60);
    expect(METHODOLOGY_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(QUIZ_TITLE.length).toBeLessThanOrEqual(60);
    expect(QUIZ_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(CALCULATOR_TITLE.length).toBeLessThanOrEqual(60);
    expect(CALCULATOR_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(COMPARE_TITLE.length).toBeLessThanOrEqual(60);
    expect(COMPARE_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("points canonical and og:url at the clean production URL", () => {
    const head = homeHead();
    expect(head.links[0]).toEqual({ rel: "canonical", href: "https://buyonce.site/" });
    expect(metaContent(head, "og:url")).toBe("https://buyonce.site/");
    expect(metaContent(head, "robots")).toBe("index, follow");
    expect(metaContent(head, "og:image")).toBe("https://buyonce.site/og.png");
    const device = devices[0];
    if (!device) throw new Error("missing device");
    const deviceMeta = deviceHead(device);
    expect(deviceMeta.links[0]?.href).toBe(`https://buyonce.site/devices/${device.slug}`);
    expect(metaContent(deviceMeta, "og:type")).toBe("article");
    expect(deviceDescription(device).length).toBeLessThanOrEqual(160);
    expect(deviceTitle(device).length).toBeLessThanOrEqual(60);
  });

  it("noindexes filtered directory, preset calculator and paired compare URLs", () => {
    const filtered = directoryHead(parseDirectoryFilters({ q: "ring", cat: "doorbell" }));
    expect(metaContent(filtered, "robots")).toBe("noindex, follow");
    expect(filtered.links[0]?.href).toBe(
      directoryPath(parseDirectoryFilters({ q: "ring", cat: "doorbell" })).replace(
        "/devices",
        "https://buyonce.site/devices",
      ),
    );
    expect(directoryPath(parseDirectoryFilters({}))).toBe("/devices");
    expect(metaContent(directoryHead({}), "robots")).toBe("index, follow");
    expect(metaContent(calculatorHead("oura-ring-4"), "robots")).toBe("noindex, follow");
    expect(metaContent(calculatorHead(), "robots")).toBe("index, follow");
    expect(metaContent(compareHead("oura-ring-4", "oura-ring-5"), "robots")).toBe(
      "noindex, follow",
    );
    expect(compareHead().links[0]?.href).toBe("https://buyonce.site/compare");
  });

  it("emits JSON-LD that parses and matches visible record names", () => {
    const home = jsonLd(homeHead());
    expect(home).toHaveLength(1);
    const homeGraph = home[0] as { "@graph": Array<{ "@type": string }> };
    expect(homeGraph["@graph"].map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    const device = devices.find((item) => item.slug === "oura-ring-4");
    if (!device) throw new Error("missing oura");
    const blocks = jsonLd(deviceHead(device)) as Array<{
      "@type": string;
      headline?: string;
      itemListElement?: Array<{ name: string }>;
    }>;
    expect(blocks.map((block) => block["@type"])).toEqual(["BreadcrumbList", "Article"]);
    expect(blocks[1]?.headline).toBe(name(device));
    expect(JSON.parse(JSON.stringify(blocks))).toEqual(blocks);
    const list = jsonLd(directoryHead({})) as Array<{ "@type": string; numberOfItems?: number }>;
    expect(list.find((block) => block["@type"] === "ItemList")?.numberOfItems).toBe(
      filterDevices(parseDirectoryFilters({})).length,
    );
  });
});

describe("crawl files", () => {
  it("lists only clean indexable URLs with known lastmod dates", () => {
    const xml = sitemapXml();
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(indexableEntries()).toHaveLength(devices.length + 6);
    for (const entry of indexableEntries()) {
      expect(entry.loc.startsWith(`${SITE_URL}/`)).toBe(true);
      expect(entry.loc.includes("?")).toBe(false);
      expect(entry.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(xml).toContain(`<loc>${entry.loc}</loc>`);
    }
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locs.every((loc) => loc && !loc.includes("?"))).toBe(true);
  });

  it("allows search and AI crawlers and publishes the sitemap", () => {
    const robots = robotsTxt();
    for (const agent of [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "PerplexityBot",
      "ClaudeBot",
      "Google-Extended",
      "Applebot-Extended",
      "Bingbot",
    ]) {
      expect(robots).toContain(`User-agent: ${agent}`);
    }
    expect(robots).toContain("Allow: /");
    expect(robots).not.toContain("Disallow");
    expect(robots).toContain("Sitemap: https://buyonce.site/sitemap.xml");
  });

  it("summarizes the site for answer engines with real record links", () => {
    const llms = llmsTxt();
    expect(llms).toContain("# BuyOnce");
    expect(llms).toContain("https://buyonce.site/devices");
    expect(llms).toContain("No affiliate links");
    for (const device of devices)
      expect(llms).toContain(`https://buyonce.site/devices/${device.slug}`);
  });

  it("publishes one IndexNow key file whose body is the key", () => {
    const keys = readdirSync("public").filter((file) => /^[0-9a-f]{32}\.txt$/.test(file));
    expect(keys).toHaveLength(1);
    const filename = keys[0];
    if (!filename) throw new Error("missing key");
    expect(readFileSync(`public/${filename}`, "utf8")).toBe(filename.replace(/\.txt$/, ""));
  });
});
