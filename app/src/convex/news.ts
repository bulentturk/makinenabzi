import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";

const digestValidator = v.union(
  v.literal("instant"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("off"),
);

/**
 * Fallback preferences for a reader who has never opened settings.
 * An empty `categories` array means "every category the newsroom publishes".
 */
export const DEFAULT_PREFS = {
  pushEnabled: true,
  breakingOnly: false,
  digest: "instant" as const,
  quietStart: 23,
  quietEnd: 7,
  categories: [] as string[],
};

/** Stories from makinenabzi.com, newest first. */
export const feed = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 40, 1), 100);
    const category = args.category;

    const rows =
      category && category !== "tumu"
        ? await ctx.db
            .query("articles")
            .withIndex("by_category_publishedAt", (q) =>
              q.eq("category", category),
            )
            .filter((q) => q.neq(q.field("isPublished"), false))
            .order("desc")
            .take(limit)
        : await ctx.db
            .query("articles")
            .withIndex("by_publishedAt")
            .filter((q) => q.neq(q.field("isPublished"), false))
            .order("desc")
            .take(limit);

    const term = args.search?.trim().toLocaleLowerCase("tr");
    if (!term) return rows;

    return rows.filter((article) =>
      `${article.title} ${article.summary} ${article.facts.join(" ")} ${article.tags.join(" ")}`
        .toLocaleLowerCase("tr")
        .includes(term),
    );
  },
});

/** Category labels currently in the feed, with counts, for the filter chips. */
export const categoryStats = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    const counts = new Map<string, number>();
    for (const article of articles) {
      if (article.isPublished === false) continue;
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }
    return {
      total: articles.filter((article) => article.isPublished !== false).length,
      categories: [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr")),
    };
  },
});

export const getById = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    return article?.isPublished === false ? null : article;
  },
});

/** The story currently flagged as "son dakika", if any. */
export const latestBreaking = query({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("articles")
      .withIndex("by_breaking", (q) => q.eq("breaking", true))
      .filter((q) => q.neq(q.field("isPublished"), false))
      .order("desc")
      .first(),
});

/** When makinenabzi.com was last mirrored, for the settings screen. */
export const latestSync = query({
  args: {},
  handler: async (ctx) =>
    await ctx.db
      .query("siteSync")
      .withIndex("by_key", (q) => q.eq("key", "makinenabzi.com"))
      .unique(),
});

// ---------------------------------------------------------------------------
// Saved stories
// ---------------------------------------------------------------------------

export const myBookmarkIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const articles = await Promise.all(rows.map((row) => ctx.db.get(row.articleId)));
    return articles
      .filter(
        (article): article is NonNullable<typeof article> =>
          article !== null && article.isPublished !== false,
      )
      .map((article) => article._id);
  },
});

export const myBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    const articles = await Promise.all(
      rows.map((row) => ctx.db.get(row.articleId)),
    );
    return articles.filter(
      (article) => article !== null && article.isPublished !== false,
    );
  },
});

export const toggleBookmark = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Haber kaydetmek için giriş yapmalısınız.");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_article", (q) =>
        q.eq("userId", userId).eq("articleId", args.articleId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }

    const article = await ctx.db.get(args.articleId);
    if (!article || article.isPublished === false) {
      throw new Error("Bu haber artık yayında değil.");
    }

    await ctx.db.insert("bookmarks", {
      userId,
      articleId: args.articleId,
      createdAt: Date.now(),
    });
    return { saved: true };
  },
});

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------

export const myPrefs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return DEFAULT_PREFS;

    const prefs = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!prefs) return DEFAULT_PREFS;

    return {
      pushEnabled: prefs.pushEnabled,
      breakingOnly: prefs.breakingOnly,
      digest: prefs.digest,
      quietStart: prefs.quietStart,
      quietEnd: prefs.quietEnd,
      categories: prefs.categories,
    };
  },
});

export const savePrefs = mutation({
  args: {
    pushEnabled: v.boolean(),
    breakingOnly: v.boolean(),
    digest: digestValidator,
    quietStart: v.number(),
    quietEnd: v.number(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      throw new Error("Bildirim tercihleri için giriş yapmalısınız.");

    const existing = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("notificationPrefs", { userId, ...args });
  },
});

// ---------------------------------------------------------------------------
// Notification inbox
// ---------------------------------------------------------------------------

export const myNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 50, 1), 100));
    const articles = await Promise.all(
      rows.map((row) => row.articleId ? ctx.db.get(row.articleId) : null),
    );
    return rows.filter(
      (row, index) =>
        !row.articleId ||
        (articles[index] !== null && articles[index]?.isPublished !== false),
    );
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) return null;
    if (!notification.readAt) {
      await ctx.db.patch(args.notificationId, { readAt: Date.now() });
    }
    return args.notificationId;
  },
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    let updated = 0;
    for (const notification of rows) {
      if (notification.readAt) continue;
      await ctx.db.patch(notification._id, { readAt: Date.now() });
      updated += 1;
    }
    return updated;
  },
});

export const clearNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .collect();

    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return rows.length;
  },
});

/**
 * Pushes a story out as a "son dakika" notification to every subscriber whose
 * preferences allow it. This is the delivery half of the pipeline: the sync
 * brings content in, `pushStory` fans it out.
 */
export const pushStory = mutation({
  args: { articleId: v.optional(v.id("articles")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Son dakika bildirimi yalnızca editör tarafından gönderilebilir.");
    }
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) {
      throw new Error("Son dakika bildirimi yalnızca editör tarafından gönderilebilir.");
    }

    const recent = await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .filter((q) => q.neq(q.field("isPublished"), false))
      .order("desc")
      .take(20);

    const article = args.articleId
      ? await ctx.db.get(args.articleId)
      : (recent.find((row) => !row.breaking) ?? recent[0] ?? null);

    if (!article || article.isPublished === false) {
      if (args.articleId) throw new Error("Bu haber artık yayında değil.");
      return { delivered: 0, articleId: null };
    }

    if (!article.breaking) {
      await ctx.db.patch(article._id, { breaking: true });
    }

    const prefsRows = await ctx.db.query("notificationPrefs").take(500);

    const recipients = new Set([userId]);
    for (const prefs of prefsRows) {
      if (!prefs.pushEnabled || prefs.digest === "off") continue;
      const wantsCategory =
        prefs.breakingOnly ||
        prefs.categories.length === 0 ||
        prefs.categories.includes(article.category);
      if (wantsCategory) recipients.add(prefs.userId);
    }

    let delivered = 0;
    for (const recipient of recipients) {
      const existing = await ctx.db
        .query("notifications")
        .withIndex("by_user_createdAt", (q) => q.eq("userId", recipient))
        .order("desc")
        .take(50);

      if (existing.some((row) => row.articleId === article._id)) continue;

      await ctx.db.insert("notifications", {
        userId: recipient,
        articleId: article._id,
        title: article.title,
        body: article.summary.slice(0, 150),
        category: article.category,
        kind: "breaking",
        createdAt: Date.now(),
      });
      delivered += 1;
    }

    return { delivered, articleId: article._id };
  },
});
