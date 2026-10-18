import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { ROLES } from "../schema";

/**
 * Tek yetki noktası.
 *
 * İlan, firma ve profil işlemlerinin tümü bu yardımcıları kullanır; böylece
 * sahiplik kuralı tek yerde tanımlı kalır ve web ile mobil aynı davranışı alır.
 * İstemciden gelen `ownerId` / `userId` alanları **asla** doğrudan yazılmaz;
 * kimlik her zaman oturumdan okunur.
 */
type Ctx = QueryCtx | MutationCtx;

export async function currentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await currentUser(ctx);
  if (!user) throw new Error("Bu işlem için giriş yapmalısınız.");
  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== ROLES.ADMIN) {
    throw new Error("Bu işlem yalnızca editör yetkisiyle yapılabilir.");
  }
  return user;
}

/**
 * İlan vermek için e-posta doğrulaması istenir; misafir (anonim) hesaplar
 * yalnızca gezinir. Editörler bu kuraldan muaftır.
 */
export function isVerifiedSeller(user: Doc<"users">): boolean {
  if (user.role === ROLES.ADMIN) return true;
  if (user.isAnonymous) return false;
  return Boolean(user.emailVerificationTime);
}

export async function requireVerifiedSeller(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (!isVerifiedSeller(user)) {
    throw new Error(
      "İlan vermek için e-posta adresinizi doğrulamanız gerekir. Misafir hesaplar ilan veremez.",
    );
  }
  return user;
}

/** İlan üzerinde işlem yapan kişi sahibi mi (ya da editör mü)? */
export function canManageListing(
  user: Doc<"users">,
  listing: Doc<"listings">,
): boolean {
  return listing.ownerId === user._id || user.role === ROLES.ADMIN;
}

export async function requireListingOwner(
  ctx: Ctx,
  listingId: Doc<"listings">["_id"],
): Promise<{ user: Doc<"users">; listing: Doc<"listings"> }> {
  const user = await requireUser(ctx);
  const listing = await ctx.db.get(listingId);
  if (!listing) throw new Error("İlan bulunamadı.");
  if (!canManageListing(user, listing)) {
    throw new Error("Bu ilan sizin hesabınıza ait değil.");
  }
  return { user, listing };
}
