import { api } from "@/convex/_generated/api";
import { countdownLabel, formatFairRange } from "@/lib/fairs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Library,
  MapPin,
  Rss,
} from "lucide-react";
import { Link } from "react-router";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const DASHBOARD_PATH = "/dashboard";
const START_HREF = `/auth?returnTo=${encodeURIComponent(DASHBOARD_PATH)}`;

/**
 * Fair calendar preview. Reads the same `fairs` table the app's Keşfet tab
 * shows, so the newsroom's events file is the single source for both.
 */
export function FairsTeaser() {
  const data = useQuery(api.fairs.list, { limit: 4 });

  return (
    <section id="fuarlar" className="scroll-mt-20 border-y border-border/60 bg-surface-tint">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Fuar Takvimi
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Sektörün buluşma noktaları, tek takvimde
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            {data
              ? `${data.totals.upcoming} yaklaşan etkinlik, ${data.totals.cities} şehir. `
              : ""}
            Tarihler resmi organizatör sayfalarından doğrulanır; kesinleşmeyen
            günler için tahmini tarih yazılmaz.
            {data && data.totals.pending > 0
              ? ` Şu an ${data.totals.pending} etkinlikte tarih açıklaması bekleniyor.`
              : ""}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {data === undefined
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card"
                />
              ))
            : data.upcoming.map((fair, index) => (
                <motion.article
                  key={fair._id}
                  {...reveal}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground ring-1 ring-border">
                      {fair.sector}
                    </span>
                    <span className="ml-auto text-[0.68rem] font-semibold text-muted-foreground">
                      {countdownLabel(fair)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[0.98rem] leading-snug font-semibold">
                    {fair.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatFairRange(fair)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {fair.city} · {fair.country}
                    </span>
                  </div>
                </motion.article>
              ))}
        </div>

        <motion.div {...reveal} className="mt-8">
          <Link
            to={START_HREF}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tüm takvimi uygulamada gör
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Source registry preview: the outlets the news agent actually reads. This is
 * the visible half of the multi-source feed — every published story credits one
 * of these.
 */
export function SourcesTeaser() {
  const data = useQuery(api.sources.list, {});

  const active =
    data?.groups
      .flatMap((entry) => entry.items)
      .filter((source) => source.status === "active-rss") ?? [];

  return (
    <section id="kaynaklar" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Kaynaklar
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Çok kaynaklı akış, kaynağı gizlemeden
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Haberler tek bir siteden kopyalanmaz. Ajanın taradığı akışlar
            doğrulanır, özgün Türkçe özet ve yorum editoryal onaydan geçer;
            kaynak bağlantısı haberin içinde kalır.
            {data
              ? ` Şu an ${data.totals.active} aktif akış, ${data.totals.watchlist} izleme listesi ve ${data.totals.reference} referans kaynağı kayıtlı.`
              : ""}
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-2">
          {data === undefined
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-9 w-36 animate-pulse rounded-xl bg-muted"
                />
              ))
            : active.map((source) => (
                <motion.span
                  key={source._id}
                  {...reveal}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-[0.8rem] font-medium shadow-soft"
                >
                  <Rss className="size-3.5 text-primary" />
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      {source.name}
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </a>
                  ) : (
                    source.name
                  )}
                </motion.span>
              ))}
        </div>

        <motion.div
          {...reveal}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Rss,
              label: "Aktif akış",
              value: data?.totals.active ?? 0,
              note: "Ajanın her gün taradığı doğrulanmış RSS kaynakları",
            },
            {
              icon: Library,
              label: "İzleme listesi",
              value: data?.totals.watchlist ?? 0,
              note: "Otomatik akışı doğrulanmayı bekleyen yayınlar",
            },
            {
              icon: ExternalLink,
              label: "Referans havuzu",
              value: data?.totals.reference ?? 0,
              note: "Araştırma ve doğrulamada başvurulan kuruluşlar",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="size-4" />
                  <span className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase">
                    {card.label}
                  </span>
                </div>
                <p className="mt-3 font-display text-[1.9rem] leading-none font-semibold">
                  {card.value}
                </p>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
                  {card.note}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
