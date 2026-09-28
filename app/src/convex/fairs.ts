import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { FAIRS } from "./seedData";

/**
 * Fair & event calendar.
 *
 * Dates are stored as `YYYY-MM-DD` strings so "is this over yet?" is a plain
 * lexicographic comparison against today's UTC date — no timezone drift when
 * the same rows are read from İstanbul or from a server in another region.
 *
 * The newsroom's policy is carried over: an unconfirmed date is never guessed.
 * Those rows keep their `dateLabel` ("2028 — kesin tarih açıklanacak") and are
 * still listed, sorted by their rough start date.
 */

type Fair = Doc<"fairs">;

/** Last day of the event, falling back to the start when the end is unknown. */
function lastDay(fair: Fair): string {
  return fair.end ?? fair.start;
}

function facetCounts(
  items: Fair[],
  pick: (fair: Fair) => string,
): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = pick(item);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
}

export const list = query({
  args: {
    sector: v.optional(v.string()),
    country: v.optional(v.string()),
    year: v.optional(v.number()),
    includePast: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("fairs").collect();
    const today = new Date().toISOString().slice(0, 10);

    const upcomingAll = rows
      .filter((fair) => lastDay(fair) >= today)
      .sort((a, b) => a.start.localeCompare(b.start));
    const pastAll = rows
      .filter((fair) => lastDay(fair) < today)
      .sort((a, b) => b.start.localeCompare(a.start));

    const matches = (fair: Fair) =>
      (!args.sector || fair.sector === args.sector) &&
      (!args.country || fair.country === args.country) &&
      (args.year === undefined ||
        new Date(fair.start).getUTCFullYear() === args.year);

    const upcoming = upcomingAll.filter(matches);
    const limited =
      args.limit && args.limit > 0 ? upcoming.slice(0, args.limit) : upcoming;

    const yearCounts = new Map<number, number>();
    for (const fair of upcomingAll) {
      const year = new Date(fair.start).getUTCFullYear();
      yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    }

    return {
      upcoming: limited,
      past: args.includePast ? pastAll.filter(matches) : [],
      // Facets come from the unfiltered upcoming set, so a chip never leads to
      // an empty list.
      sectors: facetCounts(upcomingAll, (fair) => fair.sector),
      countries: facetCounts(upcomingAll, (fair) => fair.country),
      years: [...yearCounts.entries()]
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year),
      totals: {
        all: rows.length,
        upcoming: upcomingAll.length,
        past: pastAll.length,
        /** Events still showing "tarih açıklanacak" instead of a confirmed range. */
        pending: upcomingAll.filter((fair) => !fair.end).length,
        cities: new Set(upcomingAll.map((fair) => fair.city)).size,
      },
    };
  },
});

/**
 * Replaces the calendar with the newsroom's current events file. Idempotent, so
 * it can be re-run after every editorial update.
 */
export const reseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("fairs").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const fair of FAIRS) {
      await ctx.db.insert("fairs", {
        key: `${fair.start}:${fair.name}`,
        name: fair.name,
        start: fair.start,
        end: fair.end ?? undefined,
        dateLabel: fair.dateLabel,
        city: fair.city,
        country: fair.country,
        sector: fair.sector,
        focus: fair.focus,
        url: fair.url,
        importance: fair.importance,
      });
    }

    return { imported: FAIRS.length, replaced: existing.length };
  },
});
