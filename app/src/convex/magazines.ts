import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";

/** Yayınlanmış dergi sayıları — offline paketin kaynağı. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("magazines")
      .withIndex("by_publishedAt")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 20, 1), 50));
  },
});

export const getById = query({
  args: { magazineId: v.id("magazines") },
  handler: async (ctx, args) => {
    const mag = await ctx.db.get(args.magazineId);
    if (!mag || !mag.isPublished) return null;
    const articles = await Promise.all(mag.articleIds.map((id) => ctx.db.get(id)));
    return {
      ...mag,
      articles: articles.filter(
        (a): a is NonNullable<typeof a> => a !== null && a.isPublished !== false,
      ),
    };
  },
});

/** Editör yeni sayı açar (makale listesiyle). */
export const createIssue = mutation({
  args: {
    title: v.string(),
    coverUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    articleIds: v.array(v.id("articles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (me?.role !== ROLES.ADMIN) throw new Error("Yalnızca editör sayı oluşturabilir.");
    const last = await ctx.db
      .query("magazines")
      .withIndex("by_issueNo")
      .order("desc")
      .first();
    const issueNo = (last?.issueNo ?? 0) + 1;
    return await ctx.db.insert("magazines", {
      issueNo,
      title: args.title,
      coverUrl: args.coverUrl,
      pdfUrl: args.pdfUrl,
      articleIds: args.articleIds,
      isPublished: true,
      publishedAt: Date.now(),
    });
  },
});
