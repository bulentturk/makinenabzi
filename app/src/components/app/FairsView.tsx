import { api } from "@/convex/_generated/api";
import {
  countdownLabel,
  fairIcsFile,
  fairSectors,
  formatFairRange,
  googleCalendarHref,
  hasConfirmedDates,
  type Fair,
} from "@/lib/fairs";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  History,
  MapPin,
  Newspaper,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ALL = "Tümü";

function downloadIcs(fair: Fair) {
  const file = fairIcsFile(fair);
  if (!file) return;

  const blob = new Blob([file.content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  toast.success("Takvime eklendi", { description: fair.name });
}

function FairCard({
  fair,
  onSearchArticles,
}: {
  fair: Fair;
  onSearchArticles: (term: string) => void;
}) {
  const confirmed = hasConfirmedDates(fair);
  const sectors = fairSectors(fair);
  const gcal = googleCalendarHref(fair);
  const countdown = countdownLabel(fair);

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-1.5">
        {sectors.map((sector) => (
          <span
            key={sector}
            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground ring-1 ring-border"
          >
            {sector}
          </span>
        ))}
        {fair.importance === "high" && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-semibold text-primary ring-1 ring-primary/15">
            Öncelikli
          </span>
        )}
        <span className="ml-auto text-[0.68rem] font-semibold text-muted-foreground">
          {countdown}
        </span>
      </div>

      <h3 className="mt-2.5 font-display text-[0.98rem] leading-snug font-semibold tracking-tight">
        {fair.name}
      </h3>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {formatFairRange(fair)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {fair.city} · {fair.country}
        </span>
      </div>

      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
        {fair.focus}
      </p>

      {!confirmed && (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-pulse/8 px-2.5 py-2 text-[0.72rem] leading-relaxed text-foreground/80">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-pulse" />
          Organizatör kesin günleri açıklamadı; tahmini tarih verilmiyor.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={fair.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[0.75rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Resmi etkinlik sayfası
          <ExternalLink className="size-3.5" />
        </a>

        {confirmed ? (
          <button
            type="button"
            onClick={() => downloadIcs(fair)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 text-[0.75rem] font-medium text-foreground transition-colors hover:border-border hover:bg-secondary"
          >
            <CalendarPlus className="size-3.5" />
            Takvime ekle
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onSearchArticles(fair.focus.split(",")[0].trim())}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Newspaper className="size-3.5" />
          İlgili haberler
        </button>

        {gcal ? (
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center text-[0.72rem] font-medium text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
          >
            Google Takvim
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function FairsView({
  onSearchArticles,
}: {
  onSearchArticles: (term: string) => void;
}) {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [includePast, setIncludePast] = useState(false);

  const data = useQuery(api.fairs.list, { year, sector, includePast });

  const grouped = useMemo(() => {
    const groups = new Map<number, Fair[]>();
    for (const fair of data?.upcoming ?? []) {
      const key = Number(fair.start.slice(0, 4));
      groups.set(key, [...(groups.get(key) ?? []), fair]);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [data?.upcoming]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
          <CalendarDays className="size-3" />
          Doğrulanmış sektör takvimi
        </span>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          Fuar & Etkinlik Takvimi
        </h1>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          İş makinaları, madencilik, tarım, marine & yatçılık, havalimanı GSE ve
          off-highway buluşmaları. Tarihler resmi etkinlik kaynaklarından
          doğrulanır.
          {data
            ? ` · ${data.totals.upcoming} yaklaşan etkinlik, ${data.totals.cities} şehir`
            : ""}
        </p>
      </div>

      <div className="sticky top-0 z-20 -mx-4 space-y-2.5 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-md">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {[undefined, ...(data?.years ?? []).map((entry) => entry.year)].map(
            (value) => {
              const active = year === value;
              return (
                <button
                  key={value ?? "all-years"}
                  type="button"
                  onClick={() => setYear(value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border/80 bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value ?? "Tüm yıllar"}
                  {value !== undefined && (
                    <span className="text-[0.68rem] opacity-70">
                      {data?.years.find((entry) => entry.year === value)?.count}
                    </span>
                  )}
                </button>
              );
            },
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {[undefined, ...(data?.sectors ?? []).map((entry) => entry.label)].map(
            (label) => {
              const active = sector === label;
              return (
                <button
                  key={label ?? "all-sectors"}
                  type="button"
                  onClick={() => setSector(label)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.72rem] font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label ?? ALL}
                </button>
              );
            },
          )}
        </div>

        <button
          type="button"
          onClick={() => setIncludePast((value) => !value)}
          aria-pressed={includePast}
          className={cn(
            "inline-flex items-center gap-1.5 text-[0.72rem] font-medium transition-colors",
            includePast ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <History className="size-3.5" />
          {includePast ? `${data?.past.length ?? 0} geçmiş etkinlik gösteriliyor` : "Geçmiş etkinlikleri göster"}
        </button>
      </div>

      {data === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-border/70 bg-card"
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold">
            Bu filtreyle etkinlik yok
          </p>
          <p className="mt-1 text-[0.8rem] text-muted-foreground">
            Yıl veya sektör filtresini değiştirin.
          </p>
        </div>
      ) : (
        grouped.map(([groupYear, fairs]) => (
          <section key={groupYear} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2 px-1">
              <h2 className="font-display text-base font-semibold tracking-tight">
                {groupYear}
              </h2>
              <span className="text-[0.72rem] text-muted-foreground">
                {fairs.length} doğrulanmış / izlenen etkinlik
              </span>
            </div>
            {fairs.map((fair) => (
              <FairCard
                key={fair._id}
                fair={fair}
                onSearchArticles={onSearchArticles}
              />
            ))}
          </section>
        ))
      )}

      {includePast && (data?.past.length ?? 0) > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2 px-1">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Geçmiş
            </h2>
            <span className="text-[0.72rem] text-muted-foreground">
              {data?.past.length} etkinlik
            </span>
          </div>
          {data?.past.map((fair) => (
            <FairCard
              key={fair._id}
              fair={fair}
              onSearchArticles={onSearchArticles}
            />
          ))}
        </section>
      )}

      <div className="rounded-2xl border border-border/70 bg-secondary/60 p-4">
        <p className="text-[0.78rem] font-semibold">Takvim politikası</p>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
          Kesin tarihi açıklanmayan organizasyonlar “tarih açıklanacak” olarak
          işaretlenir; tahmini gün uydurulmaz. Tarih değişiklikleri resmi
          organizatör sayfasından güncellenir.{" "}
          {data ? `${data.totals.pending} etkinlikte tarih bekleniyor.` : ""}
        </p>
      </div>
    </div>
  );
}
