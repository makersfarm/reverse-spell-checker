import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf-8");
const hookedDescription =
  "문장을 넣으면 되/돼, 안/않, 띄어쓰기, 표준어, 외래어까지 헷갈리는 표현이 문장 속에서 밑줄로 바로 보입니다. 리버스 맞춤법 검사기로 자주 헷갈리는 한국어를 한 번에 확인하세요.";

function getJsonLdNodes() {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];

  return scripts.flatMap((script) => {
    const parsed = JSON.parse(script[1]);
    return Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
  });
}

function getMetaContent(selector: string) {
  const regex = new RegExp(`<meta(?=[^>]*${selector})(?=[^>]*content="([^"]+)")[^>]*>`, "s");

  return html.match(regex)?.[1];
}

describe("index.html SEO metadata", () => {
  it("declares the preferred Google site name as WebSite structured data", () => {
    const website = getJsonLdNodes().find((node) => node["@type"] === "WebSite");

    expect(website).toMatchObject({
      name: "리버스 맞춤법 검사기",
      url: "https://reverse-spell-checker.vercel.app/",
    });
    expect(website?.alternateName).toEqual(["맏춤법 검사기", "맏춤법"]);
    expect(JSON.stringify(website?.alternateName)).not.toContain("reverse-spell-checker.vercel.app");
  });

  it("keeps all crawlable site name signals away from the hosting platform name", () => {
    const website = getJsonLdNodes().find((node) => node["@type"] === "WebSite");

    expect(getMetaContent('property="og:site_name"')).toBe("리버스 맞춤법 검사기");
    expect(getMetaContent('name="application-name"')).toBe("리버스 맞춤법 검사기");
    expect(website?.name).toBe("리버스 맞춤법 검사기");
    expect(`${website?.name} ${website?.alternateName}`).not.toMatch(/vercel/i);
  });

  it("uses the hooked search description consistently", () => {
    const webapp = getJsonLdNodes().find((node) => node["@type"] === "WebApplication");

    expect(getMetaContent('name="description"')).toBe(hookedDescription);
    expect(getMetaContent('property="og:description"')).toBe(hookedDescription);
    expect(getMetaContent('name="twitter:description"')).toBe(hookedDescription);
    expect(webapp?.description).toBe(hookedDescription);
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
