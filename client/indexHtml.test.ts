import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf-8");

function getJsonLdNodes() {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];

  return scripts.flatMap((script) => {
    const parsed = JSON.parse(script[1]);
    return Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
  });
}

describe("index.html SEO metadata", () => {
  it("declares the preferred Google site name as WebSite structured data", () => {
    const website = getJsonLdNodes().find((node) => node["@type"] === "WebSite");

    expect(website).toMatchObject({
      name: "리버스 맞춤법 검사기",
      url: "https://reverse-spell-checker.vercel.app/",
    });
    expect(website?.alternateName).toBe("맏춤법 검사기");
    expect(JSON.stringify(website?.alternateName)).not.toContain("reverse-spell-checker.vercel.app");
  });

  it("uses a stable crawlable favicon URL", () => {
    const favicon = html.match(/<link rel="icon" href="([^"]+)"/)?.[1];

    expect(favicon).toBe("/favicon-48.png");
    expect(favicon?.startsWith("data:")).toBe(false);
    expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />');
    expect(existsSync(new URL("./public/favicon-48.png", import.meta.url))).toBe(true);
    expect(existsSync(new URL("./public/favicon.svg", import.meta.url))).toBe(true);
    expect(existsSync(new URL("./public/apple-touch-icon.png", import.meta.url))).toBe(true);
  });
});
