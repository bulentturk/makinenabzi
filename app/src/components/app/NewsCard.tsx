import { cn } from "@/lib/utils";
import { categoryMeta, formatRelative, isFresh } from "@/lib/news";
import type { Doc } from "@/convex/_generated/dataModel";
import { Bookmark, Flame } from "lucide-react";

export function CategoryBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const meta = categoryMeta(label);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide ring-1 ring-inset",
        meta.tint,
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.4} />
      {label}
    </span>
  );
}

function SaveButton({
  saved,
  onToggle,
  className,
}: {
  saved: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Kaydedilenlerden çıkar" : "Haberi kaydet"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
        saved
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground/70 hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Bookmark
        className={cn("size-4", saved && "fill-current")}
        strokeWidth={2.2}
      />
    </button>
  );
}

function FreshMarker({ publishedAt }: { publishedAt: number }) {
  if (!isFresh(publishedAt)) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-primary">
      <span className="size-1.5 animate-pulse rounded-full bg-primary" />
      yeni
    </span>
  );
}

export function NewsCard({
  article,
  saved,
  onOpen,
  onToggleSave,
  className,
}: {
  article: Doc<"articles">;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
  className?: string;
}) {
  const meta = categoryMeta(article.category);

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lift",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-4 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          meta.dot,
        )}
      />

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CategoryBadge label={article.category} />
            <FreshMarker publishedAt={article.publishedAt} />
            <span className="ml-auto text-[0.7rem] font-medium whitespace-nowrap text-muted-foreground">
              {formatRelative(article.publishedAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="mt-2 block w-full text-left"
          >
            <h3 className="font-display text-[0.98rem] leading-snug font-semibold text-balance transition-colors group-hover:text-primary">
              {article.title}
            </h3>
          </button>

          <p className="mt-1.5 line-clamp-2 text-[0.83rem] leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        </div>

        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[0.7rem] font-medium text-muted-foreground/90">
        <span>Kaynak: {article.source}</span>
        <span className="text-border">•</span>
        <span>{article.readingMinutes} dk okuma</span>
      </div>
    </article>
  );
}

/** Larger treatment used for the single lead story of the day. */
export function LeadStoryCard({
  article,
  saved,
  onOpen,
  onToggleSave,
}: {
  article: Doc<"articles">;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const meta = categoryMeta(article.category);
  const urgent = article.breaking;
  const LeadIcon = meta.icon;

  return (
    <article
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide ring-1 ring-inset",
            urgent
              ? "bg-pulse/12 text-pulse ring-pulse/25"
              : "bg-primary/10 text-primary ring-primary/20",
          )}
        >
          {urgent ? (
            <Flame className="size-3" strokeWidth={2.4} />
          ) : (
            <LeadIcon className="size-3" strokeWidth={2.4} />
          )}
          {urgent ? "SON DAKİKA" : "GÜNCEL"}
        </span>
        <span className="text-[0.7rem] font-medium text-muted-foreground">
          {formatRelative(article.publishedAt)}
        </span>
        <SaveButton
          saved={saved}
          onToggle={onToggleSave}
          className="-mt-0 -mr-0 ml-auto"
        />
      </div>

      <button type="button" onClick={onOpen} className="mt-3 block text-left">
        <h2 className="font-display text-base leading-snug font-semibold text-balance transition-colors group-hover:text-primary sm:text-[1.05rem]">
          {article.title}
        </h2>
      </button>

      <p className="mt-2 line-clamp-3 text-[0.85rem] leading-relaxed text-muted-foreground">
        {article.summary}
      </p>

      <div className="mt-3 flex items-center gap-2 text-[0.7rem] font-medium text-muted-foreground/90">
        <CategoryBadge label={article.category} />
        <span>{article.readingMinutes} dk okuma</span>
      </div>

      <span
        aria-hidden
        className={cn("absolute top-0 right-0 h-full w-1 opacity-70", meta.dot)}
      />
    </article>
  );
}
