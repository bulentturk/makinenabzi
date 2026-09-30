import { AppShell, type AppTab } from "@/components/app/AppShell";
import { ArticleReader } from "@/components/app/ArticleReader";
import { ExploreView } from "@/components/app/ExploreView";
import { FeedView } from "@/components/app/FeedView";
import { NotificationCenter } from "@/components/app/NotificationCenter";
import { SavedList } from "@/components/app/SavedList";
import { SettingsPanel } from "@/components/app/SettingsPanel";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useNotifyOnNew, useWebPush } from "@/hooks/use-web-push";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AppTab>("akis");
  const [feedSearch, setFeedSearch] = useState("");
  const [openArticleId, setOpenArticleId] = useState<Id<"articles"> | null>(
    null,
  );

  const toggleBookmark = useMutation(api.news.toggleBookmark);
  const syncNews = useAction(api.siteSync.syncNews);

  const savedIds = useQuery(api.news.myBookmarkIds) ?? [];
  const notifications = useQuery(api.news.myNotifications, {});
  const prefs = useQuery(api.news.myPrefs);
  const syncState = useQuery(api.news.latestSync);

  const push = useWebPush();
  const { permission, error: permissionError, request, show } = push;

  // Pull the newsroom in on open, unless the scheduled sync just ran.
  const syncRequested = useRef(false);
  useEffect(() => {
    if (syncRequested.current || syncState === undefined) return;
    if (syncState && Date.now() - syncState.lastRunAt < 15 * 60 * 1000) return;
    syncRequested.current = true;
    void syncNews({}).catch(() => {
      // The timeline keeps whatever was mirrored by the last successful run.
    });
  }, [syncNews, syncState]);

  const deliver = useCallback(
    (payload: { title: string; body: string; tag?: string }) => {
      if (show(payload)) return true;
      // Without browser permission the in-app inbox still works; surface the
      // story as a toast so the delivery pipeline stays visible.
      toast(payload.title, { description: payload.body });
      return false;
    },
    [show],
  );

  const toPayload = useCallback(
    (notification: {
      _id: string;
      title: string;
      body: string;
    }) => ({
      title: notification.title,
      body: notification.body,
      tag: notification._id,
    }),
    [],
  );

  useNotifyOnNew(
    notifications,
    deliver,
    prefs?.pushEnabled ?? true,
    toPayload,
  );

  const handleToggleSave = (articleId: Id<"articles">) => {
    void toggleBookmark({ articleId })
      .then((result) => {
        toast.success(result.saved ? "Haber kaydedildi" : "Kayıt kaldırıldı", {
          description: result.saved
            ? "Kaydedilenler sekmesinden ulaşabilirsiniz."
            : undefined,
        });
      })
      .catch((error: unknown) => {
        toast.error("İşlem tamamlanamadı", {
          description:
            error instanceof Error ? error.message : "Beklenmeyen bir hata.",
        });
      });
  };

  /** Sends a fair, outlet or stream topic into the feed and opens that tab. */
  const handleSearchArticles = (term: string) => {
    setFeedSearch(term);
    setTab("akis");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const unreadCount = notifications?.filter((row) => !row.readAt).length ?? 0;

  return (
    <>
      <AppShell tab={tab} onTabChange={setTab} unreadCount={unreadCount}>
        {tab === "akis" && (
          // `key` remounts the feed when a fair or outlet pre-fills the search.
          <FeedView
            key={feedSearch}
            userName={user?.name ?? undefined}
            savedIds={savedIds}
            onOpenArticle={setOpenArticleId}
            onToggleSave={handleToggleSave}
            initialSearch={feedSearch}
          />
        )}

        {tab === "kesfet" && (
          <ExploreView onSearchArticles={handleSearchArticles} />
        )}

        {tab === "bildirimler" && (
          <NotificationCenter
            permission={permission}
            permissionError={permissionError}
            onRequestPermission={() => void request()}
            onOpenArticle={setOpenArticleId}
            onEditPrefs={() => setTab("ayarlar")}
            isEditor={user?.role === "admin"}
          />
        )}

        {tab === "kaydedilenler" && (
          <SavedList
            savedIds={savedIds}
            onOpenArticle={setOpenArticleId}
            onToggleSave={handleToggleSave}
            onBrowseFeed={() => setTab("akis")}
          />
        )}

        {tab === "ayarlar" && (
          <SettingsPanel
            name={user?.name ?? undefined}
            email={user?.email ?? undefined}
            permission={permission}
            permissionError={permissionError}
            onRequestPermission={() => void request()}
            onSignOut={handleSignOut}
          />
        )}
      </AppShell>

      <ArticleReader
        articleId={openArticleId}
        onClose={() => setOpenArticleId(null)}
        savedIds={savedIds}
        onToggleSave={handleToggleSave}
      />
    </>
  );
}
