import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ExternalLink, Library, Rss, Search, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";

type Source = Doc<"sources">;

const NOTE: Record<string, string> = {
  "Aktif takip (RSS)":
    "Haber ajanının düzenli taradığı akışlar. Yayımlanan her haber bu kaynaklardan biriyle doğrulanır.",
  "İzleme listesi":
    "Otomatik akışı henüz doğrulanmamış yayınlar; aday toplamada kullanılıyor.",
  "Etkinlik kaynakları": "Fuar ve lansman takibinde kullanılan etkinlik kaynakları.",
};

function statusLabel(source: Source): string {
  switch (source.status) {
    case "active-rss":
      return "RSS aktif";
    case "watchlist-priority":
      return "Öncelikli takip";
    case "watchlist":
      return "İzleme listesi";
    case "needs-verification":
      return "Adres doğrulanacak";
    case "event-watch":
      return "Etkinlik";
    default:
      return "Referans";
  }
}

function SourceRow({
  source,
  published,
  onSearchArticles,
}: {
  source: Source;
  published: number;
  onSearchArticles: (term: string) => void;
}) {
  const active = source.status === "active-rss";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5">
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-primary/10 text-primary"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {active ? <Rss className="size-3.5" /> : <Library className="size-3.5" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.85rem] font-medium hover:text-primary"
            >
              {source.name}
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          ) : (
            <span className="text-[0.85rem] font-medium">{source.name}</span>
          )}

          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[0.64rem] font-semibold",
              active
                ? "bg-primary/10 text-primary"
                : source.status === "needs-verification"
                  ? "bg-pulse/12 text-foreground/80"
                  : "bg-secondary text-muted-foreground",
            )}
          >
            {source.status === "needs-verification" && (
              <TriangleAlert className="mr-1 size-3" />
            )}
            {statusLabel(source)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.72rem] text-muted-foreground">
          {source.sector && <span>{source.sector}</span>}
          <span>Araştırma ve doğrulama kaynağı</span>
          {source.focus.length > 0 && (
            <span className="truncate">{source.focus.slice(0, 3).join(" · ")}</span>
          )}
        </div>

        {published > 0 && (
          <button
            type="button"
            onClick={() => onSearchArticles(source.name)}
            className="mt-1.5 text-[0.72rem] font-semibold text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
          >
            {published} yayımlanmış haber
          </button>
        )}
      </div>
    </div>
  );
}

export function SourcesView({
  onSearchArticles,
}: {
  onSearchArticles: (term: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | undefined>(undefined);

  const data = useQuery(api.sources.list, {
    group,
    search: search.trim() || undefined,
  });
  const outlets = useQuery(api.sources.outletStats);

  const publishedByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const outlet of outlets ?? []) map.set(outlet.name, outlet.published);
    return map;
  }, [outlets]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
          <Library className="size-3" />
          Medya & kuruluşlar
        </span>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          Kaynaklar
        </h1>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          İçerik araştırmalarında kullanılan ana referans havuzu.
          {data
            ? ` · ${data.totals.active} aktif akış, ${data.totals.watchlist} izleme, ${data.totals.reference} referans`
            : ""}
        </p>
      </div>

      <div className="sticky top-0 z-20 -mx-4 space-y-2.5 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Yayın veya konu ara"
            aria-label="Kaynaklarda ara"
            className="h-10 w-full rounded-xl border border-border/80 bg-card pr-9 pl-9 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-[3px] focus:ring-ring/15"
          />
          {search && (
            <button
              type="button"
              aria-label="Aramayı temizle"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {(data?.catalog ?? []).map((label) => {
            const active = group === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setGroup(active ? undefined : label)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[0.74rem] font-medium transition-colors",
                  active
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {data === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl border border-border/60 bg-card"
            />
          ))}
        </div>
      ) : data.groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold">Kaynak bulunamadı</p>
          <p className="mt-1 text-[0.8rem] text-muted-foreground">
            Arama terimini kısaltın veya grubu değiştirin.
          </p>
        </div>
      ) : (
        data.groups.map((entry) => (
          <section key={entry.group} className="flex flex-col gap-2">
            <div className="px-1">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-base font-semibold tracking-tight">
                  {entry.group}
                </h2>
                <span className="text-[0.72rem] text-muted-foreground">
                  {entry.items.length} kaynak
                </span>
              </div>
              {NOTE[entry.group] && (
                <p className="mt-0.5 text-[0.74rem] leading-relaxed text-muted-foreground">
                  {NOTE[entry.group]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {entry.items.map((source) => (
                <SourceRow
                  key={source._id}
                  source={source}
                  published={publishedByName.get(source.name) ?? 0}
                  onSearchArticles={onSearchArticles}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
