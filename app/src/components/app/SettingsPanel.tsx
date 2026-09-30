import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import {
  DIGEST_OPTIONS,
  HOUR_OPTIONS,
  SECTORS,
  categoryMeta,
  formatRelative,
  type DigestValue,
} from "@/lib/news";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BellRing,
  Check,
  Loader2,
  LogOut,
  RefreshCw,
  Rss,
  Save,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { InstallGuide } from "./InstallGuide";

interface PrefsDraft {
  pushEnabled: boolean;
  breakingOnly: boolean;
  digest: DigestValue;
  quietStart: number;
  quietEnd: number;
  categories: string[];
}

function toDraft(prefs: {
  pushEnabled: boolean;
  breakingOnly: boolean;
  digest: string;
  quietStart: number;
  quietEnd: number;
  categories: string[];
}): PrefsDraft {
  return {
    pushEnabled: prefs.pushEnabled,
    breakingOnly: prefs.breakingOnly,
    digest: prefs.digest as DigestValue,
    quietStart: prefs.quietStart,
    quietEnd: prefs.quietEnd,
    categories: [...prefs.categories],
  };
}

function initials(name?: string) {
  if (!name) return "MN";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr") ?? "")
    .join("");
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[0.85rem] font-semibold">{title}</p>
        <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

export function SettingsPanel({
  name,
  email,
  permission,
  permissionError,
  onRequestPermission,
  onSignOut,
}: {
  name?: string;
  email?: string;
  permission: "unsupported" | "default" | "granted" | "denied";
  permissionError: string | null;
  onRequestPermission: () => void;
  onSignOut: () => void | Promise<void>;
}) {
  const prefs = useQuery(api.news.myPrefs);
  const stats = useQuery(api.news.categoryStats);
  const syncState = useQuery(api.news.latestSync);
  const savePrefs = useMutation(api.news.savePrefs);
  const syncNews = useAction(api.siteSync.syncNews);

  // Edits live in local state; until the reader touches a control the values
  // come straight from the server document, so there is no syncing effect.
  const [edits, setEdits] = useState<PrefsDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const draft = edits ?? (prefs ? toDraft(prefs) : null);
  const dirty =
    edits !== null &&
    prefs !== undefined &&
    JSON.stringify(edits) !== JSON.stringify(prefs);

  const update = (patch: Partial<PrefsDraft>) => {
    if (!draft) return;
    setEdits({ ...draft, ...patch });
  };

  /** Live newsroom tags, falling back to the known sector list. */
  const liveLabels =
    stats && stats.categories.length > 0
      ? stats.categories.map((entry) => entry.label)
      : SECTORS.map((sector) => sector.label);

  // An empty selection means "everything the newsroom publishes".
  const selectedLabels =
    draft && draft.categories.length > 0 ? draft.categories : liveLabels;

  const toggleCategory = (label: string) => {
    if (!draft) return;
    const current =
      draft.categories.length > 0 ? draft.categories : [...liveLabels];
    const has = current.includes(label);
    update({
      categories: has
        ? current.filter((item) => item !== label)
        : [...current, label],
    });
  };

  const handleSave = async () => {
    if (!draft || !dirty) return;
    setSaving(true);
    try {
      await savePrefs(draft);
      toast.success("Bildirim tercihleri kaydedildi");
    } catch (error) {
      toast.error("Tercihler kaydedilemedi", {
        description:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNews({ limit: 15 });
      if (result.skipped) {
        toast.info("Haber akışı az önce kontrol edildi");
        return;
      }
      if (result.ok) {
        toast.success("Haber akışı güncellendi", {
          description:
            result.imported > 0
              ? `${result.imported} yeni haber eklendi.`
              : "Yayında yeni haber yok.",
        });
      } else {
        toast.error("Akış güncellenemedi", {
          description: result.message ?? "Makinenabzi.com yanıt vermedi.",
        });
      }
    } catch (error) {
      toast.error("Akış güncellenemedi", {
        description:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Ayarlar
        </h1>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">
          Bildirim kurallarını hesabınıza göre yönetin
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.42_0.055_225)] to-[oklch(0.26_0.04_230)] font-display text-sm font-semibold text-primary-foreground">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[0.92rem] font-semibold">
            {name ?? "Makine Nabzı okuyucusu"}
          </p>
          <p className="truncate text-[0.76rem] text-muted-foreground">
            {email ?? "Misafir oturumu"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/80 px-2.5 py-1.5 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          Çıkış
        </button>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Rss className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[0.88rem] font-semibold">
              makinenabzi.com yayın akışı
            </p>
            <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
              {syncState
                ? `${syncState.scanned} yayınlanmış haber tarandı · son güncelleme ${formatRelative(syncState.lastRunAt)}`
                : "İlk güncelleme bekleniyor…"}
            </p>
          </div>
        </div>

        {syncState?.lastStatus === "error" && (
          <p className="mt-3 rounded-xl bg-destructive/8 px-3 py-2 text-[0.74rem] leading-relaxed text-destructive">
            {syncState.message ?? "Yayın akışına ulaşılamadı."}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={syncing}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-[0.8rem] font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60"
        >
          <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
          {syncing ? "Güncelleniyor…" : "Şimdi güncelle"}
        </button>
      </section>

      {!draft ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border/70 bg-card" />
      ) : (
        <section className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card px-4 shadow-soft">
          <SettingRow
            title="Bildirimler"
            description="Kapatırsanız haberler yalnızca uygulama içi kutuda birikir."
          >
            <Switch
              checked={draft.pushEnabled}
              onCheckedChange={(checked) => update({ pushEnabled: checked })}
              aria-label="Bildirimleri aç"
            />
          </SettingRow>

          <SettingRow
            title="Sadece son dakika"
            description="Rutin haberler bildirim olarak gönderilmez."
          >
            <Switch
              checked={draft.breakingOnly}
              onCheckedChange={(checked) => update({ breakingOnly: checked })}
              aria-label="Sadece son dakika bildirimi"
            />
          </SettingRow>

          <div className="py-3">
            <p className="text-[0.85rem] font-semibold">Bildirim sıklığı</p>
            <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
              {DIGEST_OPTIONS.find((option) => option.value === draft.digest)
                ?.description ?? ""}
            </p>
            <Select
              value={draft.digest}
              onValueChange={(value) =>
                update({ digest: value as DigestValue })
              }
            >
              <SelectTrigger className="mt-2.5 h-9 w-full rounded-xl text-[0.82rem]">
                <SelectValue placeholder="Sıklık seçin" />
              </SelectTrigger>
              <SelectContent>
                {DIGEST_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="py-3">
            <p className="text-[0.85rem] font-semibold">Sessiz saatler</p>
            <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
              Bu aralıkta acil olmayan bildirimler ertelenir.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Select
                value={String(draft.quietStart)}
                onValueChange={(value) => update({ quietStart: Number(value) })}
              >
                <SelectTrigger className="h-9 flex-1 rounded-xl text-[0.82rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((hour) => (
                    <SelectItem key={hour.value} value={String(hour.value)}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[0.78rem] text-muted-foreground">–</span>
              <Select
                value={String(draft.quietEnd)}
                onValueChange={(value) => update({ quietEnd: Number(value) })}
              >
                <SelectTrigger className="h-9 flex-1 rounded-xl text-[0.82rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((hour) => (
                    <SelectItem key={hour.value} value={String(hour.value)}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.85rem] font-semibold">Sektörler</p>
              <span className="text-[0.72rem] text-muted-foreground">
                {draft.categories.length === 0
                  ? "Tümü"
                  : `${draft.categories.length} seçili`}
              </span>
            </div>
            <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
              Yalnızca seçtiğiniz sektörlerde bildirim alırsınız.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {liveLabels.map((label) => {
                const meta = categoryMeta(label);
                const Icon = meta.icon;
                const active = selectedLabels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(label)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors",
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border/80 bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={2.3} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[0.85rem] font-semibold">
                  Sistem bildirim izni
                </p>
                <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
                  {permission === "granted"
                    ? "Bu cihazda açık."
                    : (permissionError ??
                      "Cihaz bildirimleri için tarayıcı izni gerekiyor.")}
                </p>
              </div>
              {permission !== "granted" && (
                <button
                  type="button"
                  onClick={onRequestPermission}
                  className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-[0.75rem] font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  <BellRing className="size-3.5" />
                  İzin ver
                </button>
              )}
            </div>
          </div>

          <div className="py-4">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => void handleSave()}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.85rem] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : dirty ? (
                <Save className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              {dirty ? "Tercihleri kaydet" : "Kaydedildi"}
            </button>
          </div>
        </section>
      )}

      <InstallGuide />

      <p className="px-1 pb-2 text-[0.72rem] leading-relaxed text-muted-foreground">
        Bu uygulama makinenabzi.com haber akışını yansıtır. Yeni bir haber
        editoryal onaydan geçip yayına girdiğinde akışa eklenir ve bildirim
        kuralınıza göre iletilir.
      </p>
    </div>
  );
}
