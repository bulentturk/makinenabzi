"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  type ActionCtx,
} from "./_generated/server";
import { parsePublishedFeed, type SiteArticle } from "./siteFeed";

/**
 * Mirrors the makinenabzi.com newsroom into the app.
 *
 * Two paths, tried in order:
 *
 * 1. `/feed.json` — the newsroom's structured content layer. It carries the
 *    approved fields (dek, öne çıkan bilgiler, Makine Nabzı yorumu, kaynak) in
 *    one request, so nothing depends on the shape of a rendered page.
 * 2. `/rss.xml` plus one request per article page — the fallback while the
 *    site has not published `feed.json` yet.
 *
 * Only stories that are not mirrored yet are fetched, which keeps a run cheap.
 */

const SITE = "https://makinenabzi.com";
const FEED_URL = `${SITE}/rss.xml`;
/** Override with `convex env set NEWS_FEED_JSON_URL <url>` while testing. */
const FEED_JSON_URL =
  process.env.NEWS_FEED_JSON_URL ?? `${SITE}/feed.json`;
const MAX_PER_RUN = 25;
const FETCH_CONCURRENCY = 6;
const THROTTLE_MS = 60 * 1000;

type SyncedArticle = SiteArticle;

function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number(dec)),
    )
    .replace(/&quot;|&apos;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ");
}

function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block: string, name: string): string {
  const match = block.match(
    new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"),
  );
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function sectionHtml(html: string, className: string): string | null {
  const start = html.indexOf(`<section class="${className}">`);
  if (start === -1) return null;
  const end = html.indexOf("</section>", start);
  if (end === -1) return null;
  return html.slice(start, end);
}

function paragraphsIn(html: string): string[] {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => textOf(match[1]))
    .filter((text) => text.length > 0);
}

function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function slugFromUrl(link: string): string {
  const clean = link.split("?")[0].replace(/\/+$/, "");
  return clean.split("/").pop() ?? "";
}

interface FeedItem {
  title: string;
  link: string;
  publishedAt: number;
  description: string;
}

function parseFeed(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const block = match[1];
    const link = tagValue(block, "link");
    const parsed = Date.parse(tagValue(block, "pubDate"));
    return {
      title: textOf(tagValue(block, "title")),
      link,
      publishedAt: Number.isNaN(parsed) ? Date.now() : parsed,
      description: textOf(tagValue(block, "description")),
    };
  });
}

function parseArticlePage(html: string, item: FeedItem): SyncedArticle {
  const slug = slugFromUrl(item.link);
  const url = item.link.startsWith("http") ? item.link : `${SITE}${item.link}`;

  const titleTag = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const dekTag = html.match(/<p class="article-dek"[^>]*>([\s\S]*?)<\/p>/i);
  const categoryTag = html.match(/<span class="tag"[^>]*>([\s\S]*?)<\/span>/i);
  const timeTag = html.match(/<time datetime="([^"]+)"/i);

  const bodyStart = html.indexOf('<div class="article-body">');
  let introHtml = "";
  if (bodyStart !== -1) {
    const sectionIdx = html.indexOf("<section", bodyStart);
    const articleEnd = html.indexOf("</article>", bodyStart);
    let end = sectionIdx !== -1 ? sectionIdx : articleEnd;
    if (end === -1) end = html.length;
    introHtml = html.slice(bodyStart, end);
  }

  const factsHtml = sectionHtml(html, "article-facts");
  const analysisHtml = sectionHtml(html, "article-analysis");
  const sourceHtml = sectionHtml(html, "article-source");

  const facts = factsHtml
    ? [...factsHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((match) => textOf(match[1]))
        .filter((text) => text.length > 0)
    : [];

  const analysisParagraphs = analysisHtml ? paragraphsIn(analysisHtml) : [];
  const sourceParagraphs = sourceHtml ? paragraphsIn(sourceHtml) : [];
  const sourceHref = sourceHtml?.match(/<a[^>]+href="([^"]+)"/i)?.[1];

  const summary = dekTag ? textOf(dekTag[1]) : item.description;
  const paragraphs = paragraphsIn(introHtml);
  const body = paragraphs.length > 0 ? paragraphs.join("\n\n") : summary;

  const publishedAt = timeTag
    ? Date.parse(timeTag[1]) || item.publishedAt
    : item.publishedAt;

  const category = categoryTag ? textOf(categoryTag[1]) : "Haberler";

  return {
    slug,
    url,
    title: titleTag ? textOf(titleTag[1]) : item.title,
    summary,
    body,
    facts,
    analysis: analysisParagraphs.join("\n\n") || undefined,
    category,
    source: sourceParagraphs[0] ?? "Makine Nabzı",
    sourceUrl: sourceHref,
    readingMinutes: readingMinutes(
      [summary, body, facts.join(" "), analysisParagraphs.join(" ")].join(" "),
    ),
    publishedAt,
    // "Son dakika" stays an editorial decision: the feed lead is derived from
    // recency in the app, and `pushStory` is what flags a story as breaking.
    breaking: false,
    tags: [],
  };
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MakineNabziApp/1.0 (+https://makinenabzi.com)",
      accept: "text/html,application/xml",
    },
  });
  if (!response.ok) {
    throw new Error(`${url} yanıt vermedi (HTTP ${response.status})`);
  }
  return await response.text();
}

async function fetchArticle(
  item: FeedItem,
): Promise<{ article?: SyncedArticle; error?: string }> {
  try {
    const html = await fetchText(
      item.link.startsWith("http") ? item.link : `${SITE}${item.link}`,
    );
    return { article: parseArticlePage(html, item) };
  } catch (error) {
    return {
      error: `${slugFromUrl(item.link)} → ${
        error instanceof Error ? error.message : "bilinmeyen hata"
      }`,
    };
  }
}

export type SyncResult = {
  ok: boolean;
  scanned: number;
  imported: number;
  /** Rows whose editorial fields were backfilled from the structured feed. */
  enriched?: number;
  skipped?: boolean;
  message?: string;
};

interface SyncStateRow {
  lastRunAt: number;
  lastStatus: "ok" | "error";
  imported: number;
  scanned: number;
  message?: string;
}

/**
 * Preferred path: the newsroom's structured feed (see `siteFeed.ts`). Returns
 * `null` when the endpoint is not published yet, so the caller can fall back.
 */
async function runStructuredSync(
  ctx: ActionCtx,
  limit: number,
): Promise<SyncResult | null> {
  let raw: string;
  try {
    raw = await fetchText(FEED_JSON_URL);
  } catch {
    return null;
  }

  const articles = parsePublishedFeed(raw, SITE);
  if (!articles || articles.length === 0) return null;

  const known: string[] = await ctx.runQuery(
    internal.siteSyncStore.knownSlugs,
    { slugs: articles.map((article) => article.slug) },
  );
  const knownSet = new Set(known);

  // New stories first, then the already-mirrored ones so a row that arrived
  // headline-only from the RSS path can be backfilled with the editorial
  // fields (öne çıkan bilgiler, Makine Nabzı yorumu, kaynak).
  const fresh = articles.filter((article) => !knownSet.has(article.slug));
  const mirrored = articles.filter((article) => knownSet.has(article.slug));

  const { inserted, enriched } = await ctx.runMutation(
    internal.siteSyncStore.commitArticles,
    { articles: [...fresh.slice(0, limit), ...mirrored.slice(0, limit)] },
  );

  await ctx.runMutation(internal.siteSyncStore.recordSync, {
    lastStatus: "ok",
    imported: inserted,
    scanned: articles.length,
    message:
      enriched > 0
        ? `${enriched} haberin editoryal alanları güncellendi`
        : undefined,
  });

  return { ok: true, scanned: articles.length, imported: inserted, enriched };
}

/** Fallback path: the RSS index plus one request per article page. */
async function runRssSync(ctx: ActionCtx, limit: number): Promise<SyncResult> {
  const feedXml = await fetchText(FEED_URL);
  const items = parseFeed(feedXml).filter((item) => item.link.includes("/haberler/"));

  const known: string[] = await ctx.runQuery(
    internal.siteSyncStore.knownSlugs,
    { slugs: items.map((item) => slugFromUrl(item.link)) },
  );
  const knownSet = new Set(known);
  const fresh = items
    .filter((item) => !knownSet.has(slugFromUrl(item.link)))
    .slice(0, limit);

  const collected: SyncedArticle[] = [];
  const failures: string[] = [];
  for (let index = 0; index < fresh.length; index += FETCH_CONCURRENCY) {
    const batch = fresh.slice(index, index + FETCH_CONCURRENCY);
    const results = await Promise.all(batch.map((item) => fetchArticle(item)));
    for (const result of results) {
      if (result.article) collected.push(result.article);
      if (result.error) failures.push(result.error);
    }
  }

  const { inserted } = await ctx.runMutation(
    internal.siteSyncStore.commitArticles,
    { articles: collected },
  );

  const message = failures.length > 0 ? failures.slice(0, 3).join(" | ") : undefined;

  await ctx.runMutation(internal.siteSyncStore.recordSync, {
    lastStatus: "ok",
    imported: inserted,
    scanned: items.length,
    message,
  });

  return { ok: true, scanned: items.length, imported: inserted, message };
}

async function runSync(ctx: ActionCtx, limit: number): Promise<SyncResult> {
  try {
    const structured = await runStructuredSync(ctx, limit);
    if (structured) return structured;
    return await runRssSync(ctx, limit);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen senkronizasyon hatası";

    await ctx.runMutation(internal.siteSyncStore.recordSync, {
      lastStatus: "error",
      imported: 0,
      scanned: 0,
      message,
    });

    return { ok: false, scanned: 0, imported: 0, message };
  }
}

/** Scheduled entry point: keeps the app in step with the newsroom. */
export const syncFeed = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<SyncResult> =>
    await runSync(ctx, Math.min(args.limit ?? 12, MAX_PER_RUN)),
});

/** Called by the app so a reader never waits for the scheduled run. */
export const syncNews = action({
  args: { limit: v.optional(v.number()), force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<SyncResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Haber akışını güncellemek için giriş yapmalısınız.");
    }

    const state: SyncStateRow | null = await ctx.runQuery(
      internal.siteSyncStore.readState,
      {},
    );
    if (state && !args.force && Date.now() - state.lastRunAt < THROTTLE_MS) {
      return {
        ok: state.lastStatus === "ok",
        scanned: state.scanned,
        imported: 0,
        skipped: true,
      };
    }

    return await runSync(ctx, Math.min(args.limit ?? 12, MAX_PER_RUN));
  },
});
