import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { currentUser, requireAdmin, requireUser } from "./lib/authz";

/**
 * Üyelik profili.
 *
 * Her hesabın bir profili vardır: bireysel satıcı ya da firma. Profil türü
 * ilan kotasını ve sitedeki etiketi ("Bireysel satıcı", "Bayi", "OEM")
 * belirler. Doğrulama yalnızca editör tarafından yapılır.
 */

const profileType = v.union(
  v.literal("bireysel"),
  v.literal("bayi"),
  v.literal("servis"),
  v.literal("oem"),
  v.literal("kurumsal"),
);

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    return profile
      ? {
          ...profile,
          logoUrl: profile.logoStorageId
            ? await ctx.storage.getUrl(profile.logoStorageId)
            : null,
        }
      : null;
  },
});

/** Profil yoksa oluşturur, varsa günceller. Kimlik oturumdan alınır. */
export const upsertMine = mutation({
  args: {
    type: profileType,
    displayName: v.string(),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    about: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.displayName.trim().length < 2) {
      throw new Error("Görünen ad en az 2 karakter olmalı.");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        type: args.type,
        displayName: args.displayName.trim(),
        city: args.city,
        phone: args.phone,
        about: args.about,
        ...(args.companyId !== undefined ? { companyId: args.companyId } : {}),
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId: user._id,
      type: args.type,
      displayName: args.displayName.trim(),
      city: args.city,
      phone: args.phone,
      about: args.about,
      companyId: args.companyId,
      verification: "yok",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Firma doğrulaması için başvuru. */
export const requestVerification = mutation({
  args: { note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new Error("Önce profil bilgilerinizi doldurun.");
    await ctx.db.patch(profile._id, {
      verification: "bekliyor",
      about: args.note ?? profile.about,
      updatedAt: Date.now(),
    });
    return profile._id;
  },
});

/** Editör: doğrulamayı onayla veya kaldır. */
export const setVerification = mutation({
  args: {
    userId: v.id("users"),
    verified: v.boolean(),
    listingQuota: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) throw new Error("Profil bulunamadı.");
    await ctx.db.patch(profile._id, {
      verification: args.verified ? "dogrulandi" : "yok",
      ...(args.listingQuota !== undefined
        ? { listingQuota: args.listingQuota }
        : {}),
      updatedAt: Date.now(),
    });
    return profile._id;
  },
});

/** Editör: doğrulama bekleyen profiller. */
export const pendingVerifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (user?.role !== "admin") return [];
    return await ctx.db
      .query("profiles")
      .collect()
      .then((rows) => rows.filter((row) => row.verification === "bekliyor"));
  },
});
