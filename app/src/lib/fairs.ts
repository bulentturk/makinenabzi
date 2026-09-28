import type { Doc } from "@/convex/_generated/dataModel";

/**
 * Fair calendar helpers.
 *
 * Mirrors the newsroom policy on /fuar-takvimi/: a date range is only shown
 * when the organiser confirmed it. Rows without a confirmed end keep their
 * `dateLabel` ("2028 — kesin tarih açıklanacak") and are never added to a
 * calendar with a guessed day.
 */

export type Fair = Doc<"fairs">;

const dayMonth = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const parseDay = (iso: string) => new Date(`${iso}T12:00:00Z`);

/** `true` when the organiser confirmed the full date range. */
export function hasConfirmedDates(fair: Fair): boolean {
  return fair.end !== undefined;
}

export function formatFairRange(fair: Fair): string {
  if (fair.dateLabel) return fair.dateLabel;
  const start = dayMonth.format(parseDay(fair.start));
  if (!fair.end) return start;
  return `${start} – ${dayMonth.format(parseDay(fair.end))}`;
}

/** Whole days until the first day of the event, measured in calendar days. */
export function daysUntil(fair: Fair, now = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = Date.parse(`${fair.start}T00:00:00Z`);
  return Math.round((start - today) / 86_400_000);
}

/** Short countdown label for the card badge. */
export function countdownLabel(fair: Fair, now = new Date()): string {
  const days = daysUntil(fair, now);
  if (days < 0) return "Geçti";
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  if (days < 14) return `${days} gün kaldı`;
  if (days < 60) return `${Math.floor(days / 7)} hafta kaldı`;
  if (days < 365) return `${Math.floor(days / 30)} ay kaldı`;
  return `${Math.floor(days / 365)} yıl kaldı`;
}

/** `YYYYMMDD`, all-day calendar format. */
function compactDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function addDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/** Escapes commas and semicolons for iCalendar TEXT values. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1");
}

/**
 * All-day calendar file for an event with confirmed dates. Returns `null` when
 * the organiser has not confirmed the range — matching the site's policy of not
 * inventing days.
 */
export function fairIcsFile(
  fair: Fair,
): { filename: string; content: string } | null {
  if (!hasConfirmedDates(fair)) return null;

  const uid = `${fair.key.replace(/[^a-zA-Z0-9.-]/g, "-")}@makinenabzi.com`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Makine Nabzi//Fuar Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(fair.start)}`,
    // DTEND is exclusive for all-day events.
    `DTEND;VALUE=DATE:${compactDate(addDay(fair.end ?? fair.start))}`,
    `SUMMARY:${escapeText(fair.name)}`,
    `LOCATION:${escapeText(`${fair.city}, ${fair.country}`)}`,
    `DESCRIPTION:${escapeText(`${fair.focus} — ${fair.url}`)}`,
    `URL:${fair.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return {
    filename: `${fair.key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`,
    content: lines.join("\r\n"),
  };
}

/** Adds the event to Google Calendar (kept for readers without an .ics handler). */
export function googleCalendarHref(fair: Fair): string | null {
  if (!hasConfirmedDates(fair)) return null;
  const start = compactDate(fair.start);
  const end = compactDate(addDay(fair.end ?? fair.start));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: fair.name,
    dates: `${start}/${end}`,
    details: `${fair.focus} — ${fair.url}`,
    location: `${fair.city}, ${fair.country}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** The sector label as it appears on the site, e.g. "İş Makinaları & Madencilik". */
export function fairSectors(fair: Fair): string[] {
  return fair.sector
    .split("&")
    .map((part) => part.trim())
    .filter(Boolean);
}
