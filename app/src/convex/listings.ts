import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";

const categoryValidator = v.union(
  v.literal("satilik"),
  v.literal("kiralik"),
  v.literal("yedek-parca"),
  v.literal("hizmet"),
);

/** Yayındaki ilanlar — herkese açık. */
export const list = query({
  args: {
    category: v.optional(categoryValidator),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 40, 1), 100));
    const term = args.search?.trim().toLocaleLowerCase("tr");
    return rows
      .filter((l) => !args.category || l.category === args.category)
      .filter((l) =>
        term
          ? `${l.title} ${l.description} ${l.city ?? ""}`
              .toLocaleLowerCase("tr")
              .includes(term)
          : true,
      );
  },
});

export const myListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("listings")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    city: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    contactName: v.string(),
    contactPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("İlan vermek için giriş yapmalısınız.");
    if (args.title.trim().length < 5) throw new Error("Başlık en az 5 karakter olmalı.");
    if (args.description.trim().length < 20)
      throw new Error("Açıklama en az 20 karakter olmalı.");
    return await ctx.db.insert("listings", {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      price: args.price,
      currency: args.currency ?? "TRY",
      city: args.city,
      companyId: args.companyId,
      contactName: args.contactName.trim(),
      contactPhone: args.contactPhone.trim(),
      images: [],
      status: "pending",
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const moderate = mutation({
  args: { listingId: v.id("listings"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (me?.role !== ROLES.ADMIN) throw new Error("Yalnızca editör onaylayabilir.");
    await ctx.db.patch(args.listingId, {
      status: args.approve ? "approved" : "rejected",
    });
    return args.listingId;
  },
});

export const remove = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Giriş gerekli.");
    const row = await ctx.db.get(args.listingId);
    if (!row) return null;
    const me = await ctx.db.get(userId);
    if (row.createdBy !== userId && me?.role !== ROLES.ADMIN)
      throw new Error("Bu ilanı silemezsiniz.");
    await ctx.db.delete(args.listingId);
    return args.listingId;
  },
});
