import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { categoryMeta, isFresh } from "@/lib/news";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Search, SearchX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LeadStoryCard, NewsCard } from "./NewsCard";

const ALL_CATEGORIES = "Tümü";

const todayFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

function greeting(name?: string) {
  return name ? `Merhaba ${name.split(" ")[0]}` : "Merhaba";
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto h-3 w-12 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-3 h-3.5 w-11/12 animate-pulse rounded-full bg-muted" />
          <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-3 w-40 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function FeedView({
  userName,
  savedIds,
  onOpenArticle,
  onToggleSave,
  initialSearch,
}: {
  userName?: string;
  savedIds: Id<"articles">[];
  onOpenArticle: (articleId: Id<"articles">) => void;
  onToggleSave: (articleId: Id<"articles">) => void;
  /** Pre-filled search, used when a fair or outlet links into the feed. */
  initialSearch?: string;
}) {
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [search, setSearch] = useState(initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const query = debouncedSearch.trim();
  const articles = useQuery(api.news.feed, {
    category: category === ALL_CATEGORIES ? undefined : category,
    search: query || undefined,
  });
  const stats = useQuery(api.news.categoryStats);
  const breaking = useQuery(api.news.latestBreaking);

  const chips = [
    { label: ALL_CATEGORIES, count: stats?.total },
    ...(stats?.categories ?? []).map((entry) => ({
      label: entry.label,
      count: entry.count,
    })),
  ];

  // One lead story at the top: an editorially flagged story when there is one,
  // otherwise the most recent story while it is still fresh.
  const lead =
    breaking && isFresh(breaking.publishedAt)
      ? breaking
      : articles?.[0] && isFresh(articles[0].publishedAt)
        ? articles[0]
        : undefined;
  const showLead = category === ALL_CATEGORIES && !query && lead !== undefined;
  const restArticles = lead
    ? (articles ?? []).filter((article) => article._id !== lead._id)
    : (articles ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-signal ring-1 ring-primary/30" />
            Akış canlı
          </span>
          <span className="text-[0.7rem] font-medium text-muted-foreground">
            {todayFormatter.format(new Date())}
          </span>
        </div>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          {greeting(userName)}
        </h1>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          makinenabzi.com gündemi
          {stats ? ` · ${stats.total} haber yayında` : ""}
        </p>
      </div>

      <div className="sticky top-0 z-20 -mx-4 space-y-3 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Model, marka veya sektör ara"
            aria-label="Haberlerde ara"
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
          {stats === undefined
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-muted"
                />
              ))
            : chips.map((chip) => {
                const meta = categoryMeta(chip.label);
                const Icon = meta.icon;
                const active = category === chip.label;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setCategory(chip.label)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors",
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={2.3} />
                    {chip.label}
                    {typeof chip.count === "number" && (
                      <span
                        className={cn(
                          "ml-0.5 text-[0.68rem]",
                          active ? "text-primary/70" : "text-muted-foreground/70",
                        )}
                      >
                        {chip.count}
                      </span>
                    )}
                  </button>
                );
              })}
        </div>
      </div>

      {showLead && lead && (
        <LeadStoryCard
          article={lead}
          saved={savedIds.includes(lead._id)}
          onOpen={() => onOpenArticle(lead._id)}
          onToggleSave={() => onToggleSave(lead._id)}
        />
      )}

      {articles === undefined ? (
        <FeedSkeleton />
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <SearchX className="size-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">
              Bu filtreyle haber bulunamadı
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
              Farklı bir sektör seçin veya arama terimini kısaltın. Haberler
              makinenabzi.com yayınından otomatik gelir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory(ALL_CATEGORIES);
            }}
            className="mt-1 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[0.8rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {restArticles.map((article) => (
            <NewsCard
              key={article._id}
              article={article}
              saved={savedIds.includes(article._id)}
              onOpen={() => onOpenArticle(article._id)}
              onToggleSave={() => onToggleSave(article._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
