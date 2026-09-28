import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import {
  ACTIVE_GROUP,
  ACTIVE_SOURCES,
  EVENT_GROUP,
  REFERENCE_POOL,
  WATCHLIST_GROUP,
  WATCHLIST_SOURCES,
  seedKey,
  type SourceKind,
  type SourceSeed,
} from "./seedData";

/**
 * The newsroom's source registry.
 *
 * This is the piece that makes the feed multi-source instead of a single-site
 * mirror: `/kaynaklar/` on the site lists who is researched, `agent/sources.json`
 * lists who is machine-read, and both live here so the app can show where a
 * story came from — and how many published stories each outlet produced.
 */

/** Render order of the groups on the Kaynaklar screen. */
export const GROUP_ORDER: string[] = [
  ACTIVE_GROUP,
  WATCHLIST_GROUP,
  EVENT_GROUP,
  ...REFERENCE_POOL.map((entry) => entry.group),
];

export const list = query({
  args: {
    group: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("sources").collect();

    const term = args.search?.trim().toLocaleLowerCase("tr");
    const filtered = rows
      .filter((source) => !args.group || source.group === args.group)
      .filter((source) =>
        term
          ? `${source.name} ${source.sector ?? ""} ${source.focus.join(" ")}`
              .toLocaleLowerCase("tr")
              .includes(term)
          : true,
      )
      .sort(
        (a, b) =>
          b.priority - a.priority || a.name.localeCompare(b.name, "tr"),
      );

    const groups = GROUP_ORDER.filter(
      (group) => !args.group || group === args.group,
    )
      .map((group) => ({
        group,
        items: filtered.filter((source) => source.group === group),
      }))
      .filter((entry) => entry.items.length > 0);

    return {
      groups,
      totals: {
        all: rows.length,
        active: rows.filter((source) => source.status === "active-rss").length,
        watchlist: rows.filter(
          (source) =>
            source.status === "watchlist" ||
            source.status === "watchlist-priority" ||
            source.status === "needs-verification" ||
            source.status === "event-watch",
        ).length,
        reference: rows.filter((source) => source.status === "reference").length,
      },
      catalog: GROUP_ORDER,
    };
  },
});

/**
 * How many published stories each outlet is credited on, so the registry shows
 * real provenance instead of a static name list.
 */
export const outletStats = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();

    const counts = new Map<string, number>();
    for (const article of articles) {
      counts.set(article.source, (counts.get(article.source) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, published]) => ({ name, published }))
      .sort(
        (a, b) => b.published - a.published || a.name.localeCompare(b.name, "tr"),
      );
  },
});

/** Normalises one registry row into the shape the `sources` table stores. */
function toDocument(seed: SourceSeed) {
  return {
    key: seed.key,
    name: seed.name,
    url: seed.url,
    feedUrl: seed.feedUrl,
    kind: seed.kind,
    status: seed.status,
    group: seed.group,
    sector: seed.sector,
    focus: seed.focus,
    priority: seed.priority,
    origin: seed.origin,
  };
}

/** Rebuilds the registry from the newsroom's source files. Idempotent. */
export const reseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sources").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    const seeds: SourceSeed[] = [];

    for (const [
      name,
      url,
      feedUrl,
      kind,
      status,
      sector,
      priority,
    ] of ACTIVE_SOURCES) {
      seeds.push({
        key: seedKey(name),
        name,
        url,
        feedUrl,
        kind,
        status,
        group: ACTIVE_GROUP,
        sector,
        focus: [],
        priority,
        origin: "agent",
      });
    }

    for (const [
      name,
      url,
      kind,
      status,
      sector,
      focus,
      priority,
    ] of WATCHLIST_SOURCES) {
      seeds.push({
        key: seedKey(name),
        name,
        url: url || undefined,
        kind,
        status,
        group: status === "event-watch" ? EVENT_GROUP : WATCHLIST_GROUP,
        sector,
        focus: focus
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        priority,
        origin: "agent",
      });
    }

    for (const entry of REFERENCE_POOL) {
      const kind: SourceKind =
        entry.group === "Türkiye kurumları" ? "institution" : "industry_media";
      for (const [name, url] of entry.items) {
        seeds.push({
          key: seedKey(name),
          name,
          url: url ?? undefined,
          kind,
          status: "reference",
          group: entry.group,
          focus: [],
          priority: 50,
          origin: "kaynaklar",
        });
      }
    }

    // `agent/sources.json` is the authority when an outlet is in both files.
    const byKey = new Map<string, SourceSeed>();
    for (const seed of seeds) {
      const previous = byKey.get(seed.key);
      if (!previous || previous.origin === "kaynaklar") {
        byKey.set(seed.key, seed);
      }
    }

    const unique = [...byKey.values()];
    for (const seed of unique) {
      await ctx.db.insert("sources", toDocument(seed));
    }

    return { imported: unique.length, replaced: existing.length };
  },
});
