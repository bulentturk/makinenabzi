import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---- Makine Nabzı newsroom ----

    // Stories mirrored from makinenabzi.com (see `siteSync.ts`).
    articles: defineTable({
      slug: v.string(), // path segment of the story URL, used for de-duplication
      url: v.string(), // canonical URL on makinenabzi.com
      title: v.string(),
      summary: v.string(), // the article's own "dek" paragraph
      body: v.string(), // intro paragraphs separated by a blank line
      facts: v.array(v.string()), // "Öne çıkan bilgiler" bullets
      analysis: v.optional(v.string()), // "Makine Nabzı yorumu"
      category: v.string(), // newsroom tag, e.g. "İş Makinaları"
      source: v.string(), // original outlet credited by the newsroom
      sourceUrl: v.optional(v.string()),
      readingMinutes: v.number(),
      publishedAt: v.number(),
      breaking: v.boolean(),
      tags: v.array(v.string()),
    })
      .index("by_slug", ["slug"])
      .index("by_publishedAt", ["publishedAt"])
      .index("by_category_publishedAt", ["category", "publishedAt"])
      .index("by_breaking", ["breaking", "publishedAt"]),

    // Per-user notification delivery preferences.
    notificationPrefs: defineTable({
      userId: v.id("users"),
      pushEnabled: v.boolean(),
      breakingOnly: v.boolean(),
      digest: v.union(
        v.literal("instant"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("off"),
      ),
      quietStart: v.number(), // hour of day, 0-23
      quietEnd: v.number(), // hour of day, 0-23
      categories: v.array(v.string()),
    }).index("by_user", ["userId"]),

    // Notifications actually delivered to a user (in-app inbox + browser push).
    notifications: defineTable({
      userId: v.id("users"),
      articleId: v.optional(v.id("articles")),
      title: v.string(),
      body: v.string(),
      category: v.string(),
      kind: v.union(
        v.literal("breaking"),
        v.literal("digest"),
        v.literal("system"),
      ),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
    }).index("by_user_createdAt", ["userId", "createdAt"]),

    // One row per external content source, so the app can show "son güncelleme".
    siteSync: defineTable({
      key: v.string(),
      lastRunAt: v.number(),
      lastStatus: v.union(v.literal("ok"), v.literal("error")),
      imported: v.number(),
      scanned: v.number(),
      message: v.optional(v.string()),
    }).index("by_key", ["key"]),

    // Verified fair & event calendar, mirrored from the newsroom's events file.
    fairs: defineTable({
      key: v.string(),
      name: v.string(),
      start: v.string(), // ISO date, YYYY-MM-DD
      end: v.optional(v.string()), // omitted when the organiser has not confirmed an end day
      dateLabel: v.optional(v.string()), // e.g. "2028 — kesin tarih açıklanacak"
      city: v.string(),
      country: v.string(),
      sector: v.string(),
      focus: v.string(),
      url: v.string(),
      importance: v.union(v.literal("high"), v.literal("medium")),
    })
      .index("by_key", ["key"])
      .index("by_start", ["start"])
      .index("by_sector", ["sector"]),

    // Outlets the newsroom tracks: active RSS feeds, watchlist, research pool.
    sources: defineTable({
      key: v.string(),
      name: v.string(),
      url: v.optional(v.string()),
      feedUrl: v.optional(v.string()),
      kind: v.union(
        v.literal("industry_media"),
        v.literal("technical_media"),
        v.literal("press_release_wire"),
        v.literal("event_source"),
        v.literal("association"),
        v.literal("institution"),
      ),
      status: v.union(
        v.literal("active-rss"),
        v.literal("watchlist"),
        v.literal("watchlist-priority"),
        v.literal("needs-verification"),
        v.literal("event-watch"),
        v.literal("reference"),
      ),
      group: v.string(),
      sector: v.optional(v.string()),
      focus: v.array(v.string()),
      priority: v.number(),
      origin: v.union(v.literal("agent"), v.literal("kaynaklar")),
    })
      .index("by_key", ["key"])
      .index("by_group", ["group"])
      .index("by_status", ["status"]),

    // Saved stories.
    bookmarks: defineTable({
      userId: v.id("users"),
      articleId: v.id("articles"),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_article", ["userId", "articleId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
