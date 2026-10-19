import type { AnyDataModel, GenericMutationCtx } from "convex/server";
import type { Id } from "../_generated/dataModel";
import { ROLES } from "../schema";

/**
 * İlk doğrulanmış hesabı editöre yükseltir.
 *
 * Kural:
 * - Misafir (anonim) hesaplar editör olamaz.
 * - Yalnızca e-postası doğrulanmış hesap aday olabilir; böylece e-posta kodu
 *   istendiği anda (kod girilmeden) yetki verilmez.
 * - Sistemde zaten bir editör varsa hiçbir şey değişmez.
 *
 * Bu geri çağırma Convex Auth'un giriş mutation'ı içinde çalışır. Convex
 * mutation'ları seri olduğu için eşzamanlı ilk girişlerde yalnızca biri
 * editör olur; diğeri güncel kaydı görüp atlanır.
 *
 * Not: Kullanıcı sayısı küçük olduğu için mevcut editör `filter` ile aranıyor.
 * Binlerce kullanıcıya çıkıldığında `users.role` için indeks eklenmeli.
 */
export async function grantFounderRole(
  ctx: GenericMutationCtx<AnyDataModel>,
  { userId }: { userId: Id<"users"> },
): Promise<void> {
  const user = (await ctx.db.get(userId)) as
    | {
        isAnonymous?: boolean | null;
        emailVerificationTime?: number | null;
        role?: string | null;
      }
    | null;

  if (!user || user.isAnonymous) return;
  if (!user.emailVerificationTime) return;
  if (user.role === ROLES.ADMIN) return;

  const existingAdmin = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
    .first();

  if (existingAdmin) return;

  await ctx.db.patch(userId, { role: ROLES.ADMIN });
}
