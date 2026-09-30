import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { editorialPatch } from "./siteSyncLogic";

export const SYNC_KEY = "makinenabzi.com";

export const readState = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSync")
      .withIndex("by_key", (q) => q.eq("key", SYNC_KEY))
      .unique();
  },
});

/** RSS fallback only downloads stories that have not already been mirrored. */
export const knownSlugs = internalQuery({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const existing: string[] = [];
    for (const slug of args.slugs) {
      const row = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (row) existing.push(slug);
    }
    return existing;
  },
});

const articleValidator = v.object({
  slug: v.string(),
  url: v.string(),
  title: v.string(),
  summary: v.string(),
  body: v.string(),
  facts: v.array(v.string()),
  analysis: v.optional(v.string()),
  category: v.string(),
  source: v.string(),
  sourceUrl: v.optional(v.string()),
  readingMinutes: v.number(),
  publishedAt: v.number(),
  breaking: v.boolean(),
  tags: v.array(v.string()),
});

export const commitArticles = internalMutation({
  args: { articles: v.array(articleValidator) },
  handler: async (ctx, args) => {
    let inserted = 0;
    let enriched = 0;

    for (const article of args.articles) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", article.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("articles", { ...article, isPublished: true });
        inserted += 1;
        continue;
      }

      // Structured feed values are authoritative, even when an editor shortens
      // a paragraph, removes a fact, changes a headline or withdraws analysis.
      // Keep the editor-controlled breaking flag and the stable document ID.
      const patch = editorialPatch(existing, article);
      if (!patch) continue;

      await ctx.db.patch(existing._id, patch);
      enriched += 1;
    }

    return { inserted, enriched };
  },
});

/** Hide withdrawn stories only after a complete structured feed was accepted. */
export const reconcilePublication = internalMutation({
  args: {
    approvedSlugs: v.array(v.string()),
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const approved = new Set(args.approvedSlugs);
    const { page, continueCursor, isDone } = await ctx.db
      .query("articles")
      .paginate({ numItems: 100, cursor: args.cursor });
    let withdrawn = 0;
    for (const row of page) {
      if (!approved.has(row.slug) && row.isPublished !== false) {
        await ctx.db.patch(row._id, { isPublished: false, breaking: false });
        withdrawn += 1;
      }
    }
    return { withdrawn, continueCursor, isDone };
  },
});

export const recordSync = internalMutation({
  args: {
    lastStatus: v.union(v.literal("ok"), v.literal("error")),
    imported: v.number(),
    scanned: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSync")
      .withIndex("by_key", (q) => q.eq("key", SYNC_KEY))
      .unique();

    const payload = {
      lastRunAt: Date.now(),
      lastStatus: args.lastStatus,
      imported: args.imported,
      scanned: args.scanned,
      message: args.message,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("siteSync", { key: SYNC_KEY, ...payload });
  },
});
