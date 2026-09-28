import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

/**
 * Taze bir Convex dağıtımını içerikle açar.
 *
 * `fairs` ve `sources` tabloları haber odasının kendi dosyalarından
 * (`src/data/events.ts`, `agent/sources.json`, `agent/source-catalog.json`)
 * üretilir; Convex'te bunlar kendiliğinden oluşmadığı için yeni bir projede
 * takvim ve kaynak dizini **boş** gelir. Bu mutation yalnızca boş olan tabloyu
 * doldurur ve içerik zaten varsa hiçbir şeye dokunmaz.
 *
 * `src/convex/crons.ts` içinden düzenli olarak çağrılır. Elle yeniden yüklemek
 * için `npx convex run fairs:reseed` / `npx convex run sources:reseed`.
 */
export const ensureSeeded = internalMutation({
  args: {},
  handler: async (ctx) => {
    const [fair, source] = await Promise.all([
      ctx.db.query("fairs").first(),
      ctx.db.query("sources").first(),
    ]);

    const filled: string[] = [];

    if (!fair) {
      const result = await ctx.runMutation(internal.fairs.reseed, {});
      filled.push(`fairs:${result.imported}`);
    }
    if (!source) {
      const result = await ctx.runMutation(internal.sources.reseed, {});
      filled.push(`sources:${result.imported}`);
    }

    return {
      /** `true` ise bu turda en az bir tablo dolduruldu. */
      seeded: filled.length > 0,
      detail: filled.join(", "),
    };
  },
});
