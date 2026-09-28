import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { categoryMeta, formatRelative } from "@/lib/news";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowUpRight,
  Bookmark,
  Clock,
  ExternalLink,
  ListChecks,
  Quote,
} from "lucide-react";
import { CategoryBadge } from "./NewsCard";

export function ArticleReader({
  articleId,
  onClose,
  savedIds,
  onToggleSave,
}: {
  articleId: Id<"articles"> | null;
  onClose: () => void;
  savedIds: Id<"articles">[];
  onToggleSave: (articleId: Id<"articles">) => void;
}) {
  const article = useQuery(
    api.news.getById,
    articleId ? { articleId } : "skip",
  );

  const saved = articleId ? savedIds.includes(articleId) : false;
  const meta = categoryMeta(article?.category ?? "");

  return (
    <Drawer
      open={articleId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent className="mx-auto max-h-[92vh] max-w-2xl overflow-hidden sm:rounded-t-3xl">
        {article ? (
          <>
            <DrawerHeader className="shrink-0 border-b border-border/60 pb-4 text-left">
              <div className="flex items-center gap-2">
                <CategoryBadge label={article.category} />
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted-foreground">
                  <Clock className="size-3" />
                  {article.readingMinutes} dk
                </span>
                <span className="ml-auto text-[0.7rem] font-medium text-muted-foreground">
                  {formatRelative(article.publishedAt)}
                </span>
              </div>
              <DrawerTitle className="mt-2.5 font-display text-[1.15rem] leading-snug font-semibold text-balance sm:text-xl">
                {article.title}
              </DrawerTitle>
              <DrawerDescription className="text-[0.83rem] leading-relaxed">
                {article.summary}
              </DrawerDescription>
            </DrawerHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-5 px-4 py-5">
                {article.body.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[0.9rem] leading-[1.75] text-foreground/90"
                  >
                    {paragraph}
                  </p>
                ))}

                {article.facts.length > 0 && (
                  <section className="rounded-2xl border border-border/70 bg-surface-tint p-4">
                    <p className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                      <ListChecks className="size-3.5" />
                      Öne çıkan bilgiler
                    </p>
                    <ul className="mt-3 space-y-2">
                      {article.facts.map((fact) => (
                        <li
                          key={fact}
                          className="flex gap-2.5 text-[0.85rem] leading-relaxed text-foreground/90"
                        >
                          <span
                            className={cn(
                              "mt-1.5 size-1.5 shrink-0 rounded-full",
                              meta.dot,
                            )}
                          />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {article.analysis && (
                  <section className="rounded-2xl border border-primary/15 bg-primary/[0.05] p-4">
                    <p className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">
                      <Quote className="size-3.5" />
                      Makine Nabzı yorumu
                    </p>
                    <p className="mt-2.5 text-[0.88rem] leading-[1.7] text-foreground/90">
                      {article.analysis}
                    </p>
                  </section>
                )}

                <section className="rounded-2xl border border-border/70 bg-card p-4">
                  <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Kaynak
                  </p>
                  <p className="mt-1.5 text-[0.85rem] font-medium">
                    {article.source}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {article.sourceUrl && (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        Orijinal kaynağı aç
                      </a>
                    )}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-muted-foreground hover:text-foreground"
                    >
                      <ArrowUpRight className="size-3.5" />
                      makinenabzi.com&apos;da oku
                    </a>
                  </div>
                </section>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-border/60 px-4 pt-3"
              style={{
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              <button
                type="button"
                onClick={() => articleId && onToggleSave(articleId)}
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                  saved
                    ? "bg-primary/10 text-primary"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Bookmark className={cn("size-4", saved && "fill-current")} />
                {saved ? "Kaydedildi" : "Haberi kaydet"}
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <DrawerTitle className="font-display text-base font-semibold">
              Haber yükleniyor
            </DrawerTitle>
            <DrawerDescription>İçerik hazırlanıyor…</DrawerDescription>
            <div className="mt-4 space-y-3">
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
