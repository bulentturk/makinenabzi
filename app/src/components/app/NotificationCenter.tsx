import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DIGEST_OPTIONS, categoryMeta, formatRelative } from "@/lib/news";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  Send,
  Sliders,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Permission = "unsupported" | "default" | "granted" | "denied";

function PermissionCard({
  permission,
  error,
  onRequest,
}: {
  permission: Permission;
  error: string | null;
  onRequest: () => void;
}) {
  if (permission === "granted") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700">
          <BellRing className="size-4" />
        </span>
        <div>
          <p className="font-display text-[0.9rem] font-semibold">
            Sistem bildirimleri açık
          </p>
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted-foreground">
            Seçtiğiniz kategorilerde haber yayına girdiği an bu cihaza bildirim
            düşecek.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "default") {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="size-4" />
          </span>
          <div>
            <p className="font-display text-[0.9rem] font-semibold">
              Bildirimleri açın
            </p>
            <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted-foreground">
              Sektörün nabzını kaçırmamak için sistem bildirimlerine izin verin.
              Tercihleriniz yalnızca seçtiğiniz kategoriler için geçerli olur.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRequest}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.82rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <BellRing className="size-4" />
          Bildirimlere izin ver
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-surface-tint p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <BellOff className="size-4" />
      </span>
      <div>
        <p className="font-display text-[0.9rem] font-semibold">
          {permission === "unsupported"
            ? "Bu tarayıcı sistem bildirimlerini desteklemiyor"
            : "Bildirim izni kapalı"}
        </p>
        <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted-foreground">
          {error ??
            "Bildirimler yine de bu sayfadaki kutuda birikir; izni tarayıcı ayarlarından açabilirsiniz."}
        </p>
      </div>
    </div>
  );
}

export function NotificationCenter({
  permission,
  permissionError,
  onRequestPermission,
  onOpenArticle,
  onEditPrefs,
}: {
  permission: Permission;
  permissionError: string | null;
  onRequestPermission: () => void;
  onOpenArticle: (articleId: Id<"articles">) => void;
  onEditPrefs: () => void;
}) {
  const notifications = useQuery(api.news.myNotifications, {});
  const prefs = useQuery(api.news.myPrefs);
  const markRead = useMutation(api.news.markNotificationRead);
  const markAllRead = useMutation(api.news.markAllNotificationsRead);
  const clearAll = useMutation(api.news.clearNotifications);
  const pushStory = useMutation(api.news.pushStory);
  const [sending, setSending] = useState(false);

  const unreadCount = notifications?.filter((row) => !row.readAt).length ?? 0;
  const digestLabel =
    DIGEST_OPTIONS.find((option) => option.value === prefs?.digest)?.label ?? "";

  const handleSendDemo = async () => {
    setSending(true);
    try {
      const result = await pushStory({});
      if (result.delivered > 0) {
        toast.success("Son dakika bildirimi gönderildi", {
          description: `${result.delivered} aboneye iletildi.`,
        });
      } else {
        toast.info("Bu haber için bildirim zaten gönderilmiş.");
      }
    } catch (error) {
      toast.error("Bildirim gönderilemedi", {
        description:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Bildirimler
          </h1>
          <p className="mt-1 text-[0.82rem] text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : "Tüm bildirimler okundu"}
          </p>
        </div>
      </div>

      <PermissionCard
        permission={permission}
        error={permissionError}
        onRequest={onRequestPermission}
      />

      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
            <Sliders className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[0.88rem] font-semibold">
              Kişisel bildirim kuralınız
            </p>
            <p className="mt-0.5 truncate text-[0.76rem] text-muted-foreground">
              {digestLabel} · {prefs?.categories.length ?? 0} kategori · sessiz
              saat {String(prefs?.quietStart ?? 0).padStart(2, "0")}:00–
              {String(prefs?.quietEnd ?? 0).padStart(2, "0")}:00
            </p>
          </div>
          <button
            type="button"
            onClick={onEditPrefs}
            className="ml-auto shrink-0 rounded-lg px-2.5 py-1.5 text-[0.76rem] font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Düzenle
          </button>
        </div>
      </div>

      {notifications && notifications.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => void markAllRead({})}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="size-3.5" />
            Okundu işaretle
          </button>
          <button
            type="button"
            onClick={() => void clearAll({})}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Temizle
          </button>
        </div>
      )}

      {notifications === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl border border-border/70 bg-card"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BellOff className="size-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">
              Henüz bildirim yok
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
              Son dakika haberleri yayına girdiğinde burada birikecek.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => {
            const meta = categoryMeta(notification.category);
            const CategoryIcon = meta.icon;
            const unread = !notification.readAt;
            return (
              <button
                key={notification._id}
                type="button"
                onClick={() => {
                  void markRead({ notificationId: notification._id });
                  if (notification.articleId) {
                    onOpenArticle(notification.articleId);
                  }
                }}
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
                  unread ? "border-primary/25" : "border-border/70",
                )}
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {notification.kind === "breaking"
                      ? "Son dakika"
                      : notification.kind === "digest"
                        ? "Özet"
                        : "Sistem"}
                  </span>
                  <span className="ml-auto text-[0.68rem] font-medium text-muted-foreground">
                    {formatRelative(notification.createdAt)}
                  </span>
                  {unread && (
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>

                <p className="mt-2 font-display text-[0.92rem] leading-snug font-semibold text-balance">
                  {notification.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.79rem] leading-relaxed text-muted-foreground">
                  {notification.body}
                </p>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-4 left-0 w-[3px] rounded-r-full",
                    unread ? meta.dot : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border/70 bg-surface-tint p-4">
        <p className="font-display text-[0.88rem] font-semibold">
          Yayın hattını test edin
        </p>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
          Editör masasının &ldquo;son dakika&rdquo; adımını simüle eder: sıradaki
          haber son dakika olarak işaretlenir ve tercihleri uyan tüm abonelere
          bildirim gönderilir. Gerçek kurulumda bu adımı CMS webhook&apos;una
          bağlayabilirsiniz.
        </p>
        <button
          type="button"
          onClick={() => void handleSendDemo()}
          disabled={sending}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-[0.82rem] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className={cn("size-3.5", sending && "animate-pulse")} />
          {sending ? "Gönderiliyor…" : "Son dakika bildirimi gönder"}
        </button>
      </div>
    </div>
  );
}
