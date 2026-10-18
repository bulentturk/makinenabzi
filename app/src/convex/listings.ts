import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  canManageListing,
  currentUser,
  requireAdmin,
  requireListingOwner,
  requireUser,
  requireVerifiedSeller,
} from "./lib/authz";

/**
 * Makine ilanları.
 *
 * Akış: draft yok; ilan `pending` olarak oluşur, editör onayıyla `approved`
 * olur. Sahibi düzenlerse ilan yeniden `pending`'e döner (onaylanmış içerik
 * sessizce değişmesin). Süresi dolan ilan `expired`, satılan `sold` olur.
 */

/** Sitedeki sektör adlarıyla birebir aynı olmalı. */
export const SECTORS = [
  "İş Makinaları",
  "Madencilik",
  "Liman & Malzeme Elleçleme",
  "Tarım Makinaları",
  "Araç Üstü Ekipman",
  "Elektrifikasyon & Dönüşüm",
  "Marine & Yatçılık",
  "Havalimanı & GSE",
] as const;

const SECTOR_SET = new Set<string>(SECTORS);

export const LISTING_DAYS = 60;
const MAX_IMAGES = 8;

/** Profil yoksa türe göre varsayılan aktif ilan hakkı. */
const DEFAULT_QUOTA: Record<string, number> = {
  bireysel: 3,
  bayi: 10,
  servis: 10,
  oem: 10,
  kurumsal: 10,
};

const TR_MAP: Record<string, string> = {
  ğ: "g",
  ü: "u",
  ş: "s",
  ı: "i",
  ö: "o",
  ç: "c",
  â: "a",
  î: "i",
  û: "u",
};

function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replace(/[ğüşıöçâîû]/g, (ch) => TR_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(
  ctx: { db: { query: any } },
  base: string,
): Promise<string> {
  const root = base || `ilan-${Date.now()}`;
  for (let i = 1; i < 200; i += 1) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    const existing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();
    if (!existing) return candidate;
  }
  return `${root}-${Date.now()}`;
}

function assertContent(title: string, description: string) {
  if (title.trim().length < 10) {
    throw new Error("Başlık en az 10 karakter olmalı.");
  }
  if (description.trim().length < 50) {
    throw new Error("Açıklama en az 50 karakter olmalı.");
  }
}

function assertSector(sector: string) {
  if (!SECTOR_SET.has(sector)) {
    throw new Error("Geçersiz sektör seçimi.");
  }
}

async function activeCount(ctx: any, ownerId: string): Promise<number> {
  const rows = await ctx.db
    .query("listings")
    .withIndex("by_owner", (q: any) => q.eq("ownerId", ownerId))
    .collect();
  return rows.filter(
    (row: Doc<"listings">) =>
      row.status === "pending" || row.status === "approved",
  ).length;
}

async function quotaFor(ctx: any, ownerId: string): Promise<number> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", ownerId))
    .unique();
  if (profile?.listingQuota) return profile.listingQuota;
  if (profile?.type) return DEFAULT_QUOTA[profile.type] ?? 3;
  return DEFAULT_QUOTA.bireysel;
}

/** Kapak ve galeri URL'lerini çözer (imzalı bağlantı). */
async function withMedia(ctx: any, listing: Doc<"listings">) {
  const images = await Promise.all(
    (listing.images ?? []).map(async (id) => ({
      id,
      url: await ctx.storage.getUrl(id),
    })),
  );
  const cover =
    (listing.coverImage &&
      images.find((image: { id: string }) => image.id === listing.coverImage)
        ?.url) ||
    images[0]?.url ||
    null;
  return { ...listing, cover, gallery: images };
}

// ---------------------------------------------------------------------------
// Herkese açık okuma
// ---------------------------------------------------------------------------

export const listApproved = query({
  args: {
    sector: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("satilik"),
        v.literal("kiralik"),
        v.literal("yedek-parca"),
        v.literal("hizmet"),
      ),
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 40, 1), 100);
    const rows =
      args.sector && SECTOR_SET.has(args.sector)
        ? await ctx.db
            .query("listings")
            .withIndex("by_sector_status", (q) =>
              q.eq("sector", args.sector!).eq("status", "approved"),
            )
            .order("desc")
            .take(limit)
        : await ctx.db
            .query("listings")
            .withIndex("by_status_createdAt", (q) => q.eq("status", "approved"))
            .order("desc")
            .take(limit);

    const term = args.search?.trim().toLocaleLowerCase("tr");
    const filtered = rows
      .filter((row) => !args.category || row.category === args.category)
      .filter((row) =>
        term
          ? `${row.title} ${row.brand ?? ""} ${row.model ?? ""} ${row.city ?? ""}`
              .toLocaleLowerCase("tr")
              .includes(term)
          : true,
      );

    return await Promise.all(filtered.map((row) => withMedia(ctx, row)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!listing) return null;
    // Yayında olmayan ilanı yalnızca sahibi/editör görebilir.
    if (listing.status !== "approved") {
      const user = await currentUser(ctx);
      if (!user || !canManageListing(user, listing)) return null;
    }
    return await withMedia(ctx, listing);
  },
});

export const sectorStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "approved"))
      .collect();
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.sector, (counts.get(row.sector) ?? 0) + 1);
    }
    return {
      total: rows.length,
      sectors: SECTORS.map((label) => ({
        label,
        count: counts.get(label) ?? 0,
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// Sahip işlemleri
// ---------------------------------------------------------------------------

export const myListings = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(100);
    return await Promise.all(rows.map((row) => withMedia(ctx, row)));
  },
});

export const myQuota = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return null;
    return {
      quota: await quotaFor(ctx, user._id),
      used: await activeCount(ctx, user._id),
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireVerifiedSeller(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    sector: v.string(),
    category: v.union(
      v.literal("satilik"),
      v.literal("kiralik"),
      v.literal("yedek-parca"),
      v.literal("hizmet"),
    ),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    hours: v.optional(v.number()),
    condition: v.optional(
      v.union(
        v.literal("sifir"),
        v.literal("ikinci-el"),
        v.literal("yenilenmis"),
      ),
    ),
    powerKw: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    city: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    priceHidden: v.optional(v.boolean()),
    contactName: v.string(),
    contactPhone: v.string(),
    contactEmail: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const user = await requireVerifiedSeller(ctx);
    assertContent(args.title, args.description);
    assertSector(args.sector);
    if (!args.contactName.trim() || !args.contactPhone.trim()) {
      throw new Error("İletişim adı ve telefonu zorunludur.");
    }
    const images = args.images ?? [];
    if (images.length > MAX_IMAGES) {
      throw new Error(`En fazla ${MAX_IMAGES} fotoğraf yükleyebilirsiniz.`);
    }
    const quota = await quotaFor(ctx, user._id);
    const used = await activeCount(ctx, user._id);
    if (used >= quota) {
      throw new Error(
        `Aktif ilan hakkınız doldu (${used}/${quota}). Önce bir ilanı kapatın.`,
      );
    }
    if (args.price !== undefined && args.price < 0) {
      throw new Error("Fiyat negatif olamaz.");
    }

    const now = Date.now();
    const slug = await uniqueSlug(
      ctx,
      `${args.title}-${args.brand ?? ""}-${args.city ?? ""}`,
    );
    return await ctx.db.insert("listings", {
      slug,
      title: args.title.trim(),
      description: args.description.trim(),
      sector: args.sector,
      category: args.category,
      brand: args.brand,
      model: args.model,
      year: args.year,
      hours: args.hours,
      condition: args.condition,
      powerKw: args.powerKw,
      weightKg: args.weightKg,
      city: args.city,
      country: "Türkiye",
      price: args.price,
      currency: args.currency ?? "TRY",
      priceHidden: args.priceHidden,
      ownerId: user._id,
      companyId: args.companyId,
      contactName: args.contactName.trim(),
      contactPhone: args.contactPhone.trim(),
      contactEmail: args.contactEmail,
      status: "pending",
      images,
      coverImage: images[0],
      views: 0,
      expiresAt: now + LISTING_DAYS * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    listingId: v.id("listings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    sector: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("satilik"),
        v.literal("kiralik"),
        v.literal("yedek-parca"),
        v.literal("hizmet"),
      ),
    ),
    price: v.optional(v.number()),
    priceHidden: v.optional(v.boolean()),
    city: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { user, listing } = await requireListingOwner(ctx, args.listingId);
    if (args.sector) assertSector(args.sector);
    if (args.title !== undefined || args.description !== undefined) {
      assertContent(args.title ?? listing.title, args.description ?? listing.description);
    }
    if (args.images && args.images.length > MAX_IMAGES) {
      throw new Error(`En fazla ${MAX_IMAGES} fotoğraf yükleyebilirsiniz.`);
    }

    const isAdmin = user.role === "admin";
    await ctx.db.patch(args.listingId, {
      ...(args.title !== undefined ? { title: args.title.trim() } : {}),
      ...(args.description !== undefined
        ? { description: args.description.trim() }
        : {}),
      ...(args.sector !== undefined ? { sector: args.sector } : {}),
      ...(args.category !== undefined ? { category: args.category } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.priceHidden !== undefined
        ? { priceHidden: args.priceHidden }
        : {}),
      ...(args.city !== undefined ? { city: args.city } : {}),
      ...(args.contactName !== undefined
        ? { contactName: args.contactName.trim() }
        : {}),
      ...(args.contactPhone !== undefined
        ? { contactPhone: args.contactPhone.trim() }
        : {}),
      ...(args.companyId !== undefined ? { companyId: args.companyId } : {}),
      ...(args.images !== undefined
        ? { images: args.images, coverImage: args.images[0] }
        : {}),
      // Onaylanmış ilan sahibi tarafından değiştirilirse yeniden onaya düşer.
      ...(isAdmin ? {} : { status: "pending" as const }),
      updatedAt: Date.now(),
    });
    return args.listingId;
  },
});

export const remove = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const { listing } = await requireListingOwner(ctx, args.listingId);
    for (const image of listing.images ?? []) {
      await ctx.storage.delete(image).catch(() => {});
    }
    await ctx.db.delete(args.listingId);
    return args.listingId;
  },
});

export const markSold = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    await requireListingOwner(ctx, args.listingId);
    await ctx.db.patch(args.listingId, {
      status: "sold",
      updatedAt: Date.now(),
    });
    return args.listingId;
  },
});

/** Satıldı/kapatıldı işaretli ilanı yeniden onaya gönderir. */
export const relist = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const { listing } = await requireListingOwner(ctx, args.listingId);
    const now = Date.now();
    await ctx.db.patch(args.listingId, {
      status: "pending",
      expiresAt: now + LISTING_DAYS * 24 * 60 * 60 * 1000,
      updatedAt: now,
    });
    return listing._id;
  },
});

/** Görüntülenme sayacı; her açılışta bir kez çağrılır. */
export const recordView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!listing || listing.status !== "approved") return null;
    await ctx.db.patch(listing._id, { views: (listing.views ?? 0) + 1 });
    return listing._id;
  },
});

// ---------------------------------------------------------------------------
// Editör (moderasyon)
// ---------------------------------------------------------------------------

export const pendingQueue = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (user?.role !== "admin") return [];
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(100);
    return await Promise.all(rows.map((row) => withMedia(ctx, row)));
  },
});

export const approve = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    await ctx.db.patch(args.listingId, {
      status: "approved",
      expiresAt: now + LISTING_DAYS * 24 * 60 * 60 * 1000,
      updatedAt: now,
    });
    await ctx.db.insert("moderationLog", {
      kind: "listing",
      targetId: args.listingId,
      action: "approve",
      adminId: admin._id,
      createdAt: now,
    });
    return args.listingId;
  },
});

export const reject = mutation({
  args: { listingId: v.id("listings"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    await ctx.db.patch(args.listingId, {
      status: "rejected",
      rejectionReason: args.reason.trim() || "İlan kurallarına uymuyor.",
      updatedAt: now,
    });
    await ctx.db.insert("moderationLog", {
      kind: "listing",
      targetId: args.listingId,
      action: "reject",
      reason: args.reason,
      adminId: admin._id,
      createdAt: now,
    });
    return args.listingId;
  },
});

// ---------------------------------------------------------------------------
// Şikayet ve favoriler
// ---------------------------------------------------------------------------

export const report = mutation({
  args: {
    listingId: v.id("listings"),
    reason: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (!args.reason.trim()) throw new Error("Şikayet nedeni zorunludur.");
    return await ctx.db.insert("listingReports", {
      listingId: args.listingId,
      reporterId: user._id,
      reason: args.reason.trim(),
      note: args.note,
      status: "acik",
      createdAt: Date.now(),
    });
  },
});

export const toggleFavorite = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("listingFavorites")
      .withIndex("by_user_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }
    await ctx.db.insert("listingFavorites", {
      listingId: args.listingId,
      userId: user._id,
      createdAt: Date.now(),
    });
    return { saved: true };
  },
});

export const myFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("listingFavorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
    const listings = await Promise.all(
      rows.map((row) => ctx.db.get(row.listingId)),
    );
    return listings.filter(
      (row): row is Doc<"listings"> =>
        row !== null && row.status === "approved",
    );
  },
});
