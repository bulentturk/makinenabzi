import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Android FCM tokenını kullanıcıya bağlar (tekrar kayıt günceller). */
export const saveToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("android"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Push kaydı için giriş yapmalısınız.");
    if (args.token.length < 10) throw new Error("Geçersiz push token.");
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { userId, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("pushTokens", {
      userId,
      token: args.token,
      platform: args.platform,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const myTokens = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const removeToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const row = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!row || row.userId !== userId) return null;
    await ctx.db.delete(row._id);
    return row._id;
  },
});
