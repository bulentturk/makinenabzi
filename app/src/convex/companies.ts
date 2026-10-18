import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { ROLES } from "./schema";

const kindValidator = v.union(
  v.literal("oem"),
  v.literal("dealer"),
  v.literal("service"),
  v.literal("supplier"),
);

function slugify(name: string): string {
  return name
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Onaylı firmalar — herkese açık rehber. */
export const list = query({
  args: {
    sector: v.optional(v.string()),
    kind: v.optional(kindValidator),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("companies")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    const term = args.search?.trim().toLocaleLowerCase("tr");
    return rows
      .filter((c) => !args.sector || c.sector === args.sector)
      .filter((c) => !args.kind || c.kind === args.kind)
      .filter((c) =>
        term
          ? `${c.name} ${c.city ?? ""} ${c.description ?? ""}`
              .toLocaleLowerCase("tr")
              .includes(term)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      .slice(0, Math.min(Math.max(args.limit ?? 50, 1), 100));
  },
});

export const getById = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.companyId);
    return row?.status === "approved" ? row : null;
  },
});

/** Kullanıcı firma önerir → pending düşer, editör onaylar. */
export const submit = mutation({
  args: {
    name: v.string(),
    sector: v.string(),
    kind: kindValidator,
    city: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Firma önermek için giriş yapmalısınız.");
    if (args.name.trim().length < 2) throw new Error("Firma adı çok kısa.");
    return await ctx.db.insert("companies", {
      key: `${Date.now()}-${slugify(args.name)}`,
      name: args.name.trim(),
      sector: args.sector,
      kind: args.kind,
      city: args.city,
      country: "Türkiye",
      website: args.website,
      phone: args.phone,
      description: args.description,
      verified: false,
      status: "pending",
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const approve = mutation({
  args: { companyId: v.id("companies"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (me?.role !== ROLES.ADMIN) throw new Error("Yalnızca editör onaylayabilir.");
    await ctx.db.patch(args.companyId, {
      status: args.approve ? "approved" : "rejected",
      verified: args.approve,
    });
    return args.companyId;
  },
});

/** İlk kurulumda 3 örnek firma (sadece tablo boşsa). */
export const reseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("companies").first();
    if (existing) return { skipped: true };
    const now = Date.now();
    const seeds = [
      { name: "Örnek Makine A.Ş.", sector: "İş Makinaları", kind: "dealer" as const, city: "İstanbul" },
      { name: "Anadolu Maden Servis", sector: "Madencilik", kind: "service" as const, city: "Ankara" },
      { name: "Liman Parça Tedarik", sector: "Liman & Malzeme Elleçleme", kind: "supplier" as const, city: "İzmir" },
    ];
    for (const s of seeds) {
      await ctx.db.insert("companies", {
        key: `seed-${slugify(s.name)}`,
        name: s.name,
        sector: s.sector,
        kind: s.kind,
        city: s.city,
        country: "Türkiye",
        verified: true,
        status: "approved",
        createdAt: now,
      });
    }
    return { imported: seeds.length };
  },
});
