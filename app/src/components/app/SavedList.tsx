import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { BookmarkX } from "lucide-react";
import { NewsCard } from "./NewsCard";

export function SavedList({
  savedIds,
  onOpenArticle,
  onToggleSave,
  onBrowseFeed,
}: {
  savedIds: Id<"articles">[];
  onOpenArticle: (articleId: Id<"articles">) => void;
  onToggleSave: (articleId: Id<"articles">) => void;
  onBrowseFeed: () => void;
}) {
  const bookmarks = useQuery(api.news.myBookmarks, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Kaydedilenler
        </h1>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">
          {bookmarks && bookmarks.length > 0
            ? `${bookmarks.length} haber kayıtlı`
            : "Daha sonra okumak için haber kaydedin"}
        </p>
      </div>

      {bookmarks === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-border/70 bg-card"
            />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BookmarkX className="size-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">
              Kaydedilen haber yok
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
              Akıştaki yer imi simgesine dokunarak haberleri buraya alın.
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseFeed}
            className="mt-1 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[0.8rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Akışa dön
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((article) => (
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
