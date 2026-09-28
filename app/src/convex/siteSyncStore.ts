import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

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

/** Which of these slugs are already mirrored, so the sync only fetches new ones. */
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
        await ctx.db.insert("articles", article);
        inserted += 1;
        continue;
      }

      // The RSS path yields a headline and a dek. Once the structured feed
      // knows the editorial fields for the same slug, backfill them rather
      // than leaving a half-populated row in the timeline.
      const gainsBody = article.body.length > existing.body.length;
      const gainsFacts = article.facts.length > existing.facts.length;
      const gainsAnalysis = Boolean(article.analysis) && !existing.analysis;
      if (!gainsBody && !gainsFacts && !gainsAnalysis) continue;

      await ctx.db.patch(existing._id, {
        summary: article.summary,
        body: gainsBody ? article.body : existing.body,
        facts: gainsFacts ? article.facts : existing.facts,
        analysis: article.analysis ?? existing.analysis,
        category: article.category,
        source: article.source,
        sourceUrl: article.sourceUrl ?? existing.sourceUrl,
        readingMinutes: article.readingMinutes,
        tags: article.tags.length > 0 ? article.tags : existing.tags,
        // `breaking` stays untouched: only `pushStory` may flag a story.
      });
      enriched += 1;
    }

    return { inserted, enriched };
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
