import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  Ban,
  Check,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type ManagedListing = Doc<"listings"> & {
  cover: string | null;
  gallery: { id: Id<"_storage">; url: string | null }[];
};

const STATUS: Record<
  Doc<"listings">["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Onay bekliyor",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  approved: {
    label: "Yayında",
    className: "bg-primary/10 text-primary",
  },
  rejected: {
    label: "Reddedildi",
    className: "bg-destructive/10 text-destructive",
  },
  sold: {
    label: "Satıldı",
    className: "bg-secondary text-muted-foreground",
  },
  expired: {
    label: "Süresi doldu",
    className: "bg-secondary text-muted-foreground",
  },
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }: { status: Doc<"listings">["status"] }) {
  const meta = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold",
        meta.className,
      )}
    >
      {status === "approved" ? (
        <BadgeCheck className="size-3" />
      ) : status === "pending" ? (
        <Clock className="size-3" />
      ) : status === "rejected" ? (
        <Ban className="size-3" />
      ) : null}
      {meta.label}
    </span>
  );
}

function ListingRow({
  listing,
  onEdit,
}: {
  listing: ManagedListing;
  onEdit: (listing: ManagedListing) => void;
}) {
  const remove = useMutation(api.listings.remove);
  const markSold = useMutation(api.listings.markSold);
  const relist = useMutation(api.listings.relist);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, work: () => Promise<unknown>, done: string) {
    setBusy(action);
    try {
      await work();
      toast.success(done);
    } catch (error) {
      toast.error("İşlem tamamlanamadı", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-soft">
      {listing.cover ? (
        <img
          src={listing.cover}
          alt=""
          className="size-20 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-secondary text-[0.65rem] text-muted-foreground">
          Foto yok
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <span className="inline-flex items-center gap-1 text-[0.68rem] text-muted-foreground">
            <Eye className="size-3" />
            {listing.views}
          </span>
        </div>
        <h3 className="mt-1 truncate text-[0.85rem] font-semibold">
          {listing.title}
        </h3>
        <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
          {listing.sector}
          {listing.city ? ` · ${listing.city}` : ""} ·{" "}
          {dateFormat.format(new Date(listing.createdAt))}
        </p>
        {listing.status === "rejected" && listing.rejectionReason && (
          <p className="mt-1 text-[0.72rem] font-medium text-destructive">
            {listing.rejectionReason}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-lg px-2 text-[0.7rem]"
            onClick={() => onEdit(listing)}
          >
            <Pencil className="size-3" /> Düzenle
          </Button>

          {listing.status !== "sold" && listing.status !== "expired" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg px-2 text-[0.7rem]"
              disabled={busy !== null}
              onClick={() =>
                void run("sold", () => markSold({ listingId: listing._id }), "İlan satıldı olarak işaretlendi")
              }
            >
              {busy === "sold" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Satıldı
            </Button>
          )}

          {(listing.status === "sold" || listing.status === "expired") && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg px-2 text-[0.7rem]"
              disabled={busy !== null}
              onClick={() =>
                void run("relist", () => relist({ listingId: listing._id }), "İlan yeniden onaya gönderildi")
              }
            >
              {busy === "relist" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              Yeniden yayınla
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-lg px-2 text-[0.7rem] text-destructive hover:bg-destructive/10"
            disabled={busy !== null}
            onClick={() => {
              if (!window.confirm("İlan kalıcı olarak silinsin mi?")) return;
              void run("remove", () => remove({ listingId: listing._id }), "İlan silindi");
            }}
          >
            {busy === "remove" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            Sil
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MyListingsView({
  onNew,
  onEdit,
  isEditor,
}: {
  onNew: () => void;
  onEdit: (listing: ManagedListing) => void;
  isEditor: boolean;
}) {
  const listings = useQuery(api.listings.myListings) as ManagedListing[] | undefined;
  const quota = useQuery(api.listings.myQuota);
  const pending = useQuery(api.listings.pendingQueue) as ManagedListing[] | undefined;

  const [segment, setSegment] = useState<"ilanlarim" | "moderasyon">("ilanlarim");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            İlanlarım
          </h1>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
            {quota
              ? `${quota.used}/${quota.quota} aktif ilan hakkı kullanılıyor.`
              : "İlanlarınız burada listelenir."}
          </p>
        </div>
        <Button size="sm" className="rounded-xl" onClick={onNew}>
          <Plus className="size-4" /> İlan ver
        </Button>
      </div>

      {isEditor && (
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setSegment("ilanlarim")}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold transition-colors",
              segment === "ilanlarim"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground",
            )}
          >
            İlanlarım
          </button>
          <button
            type="button"
            onClick={() => setSegment("moderasyon")}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold transition-colors",
              segment === "moderasyon"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground",
            )}
          >
            Moderasyon{pending && pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        </div>
      )}

      {segment === "moderasyon" ? (
        <ModerationQueue rows={pending} />
      ) : listings === undefined ? (
        <p className="text-[0.8rem] text-muted-foreground">İlanlar yükleniyor…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="text-[0.85rem] font-semibold">Henüz ilanınız yok.</p>
          <p className="mx-auto mt-1 max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground">
            Makinenizi fotoğrafla birlikte yükleyin; editör onayından sonra
            sitenin ilanlar bölümünde yayınlanır.
          </p>
          <Button size="sm" className="mt-3 rounded-xl" onClick={onNew}>
            <Plus className="size-4" /> İlk ilanı ver
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {listings.map((listing) => (
            <ListingRow key={listing._id} listing={listing} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModerationQueue({ rows }: { rows: ManagedListing[] | undefined }) {
  const approve = useMutation(api.listings.approve);
  const reject = useMutation(api.listings.reject);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function handle(listingId: Id<"listings">, approveIt: boolean) {
    setBusy(listingId);
    try {
      if (approveIt) {
        await approve({ listingId });
        toast.success("İlan yayına alındı");
      } else {
        await reject({
          listingId,
          reason: reasons[listingId]?.trim() || "İlan kurallarına uymuyor.",
        });
        toast.success("İlan reddedildi");
      }
    } catch (error) {
      toast.error("İşlem tamamlanamadı", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  if (rows === undefined) {
    return <p className="text-[0.8rem] text-muted-foreground">Kuyruk yükleniyor…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-[0.82rem] text-muted-foreground">
        Onay bekleyen ilan yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((listing) => (
        <article
          key={listing._id}
          className="rounded-2xl border border-border/70 bg-card p-3 shadow-soft"
        >
          <div className="flex gap-3">
            {listing.cover ? (
              <img
                src={listing.cover}
                alt=""
                className="size-20 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-secondary text-[0.65rem] text-muted-foreground">
                Foto yok
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-[0.85rem] font-semibold">{listing.title}</h3>
              <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                {listing.sector} · {listing.contactName} · {listing.contactPhone}
              </p>
              <p className="mt-1 line-clamp-3 text-[0.75rem] leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          </div>

          <Input
            value={reasons[listing._id] ?? ""}
            onChange={(event) =>
              setReasons((current) => ({
                ...current,
                [listing._id]: event.target.value,
              }))
            }
            placeholder="Red gerekçesi (isteğe bağlı)"
            className="mt-2 h-8 text-[0.75rem]"
          />

          <div className="mt-2 flex gap-1.5">
            <Button
              size="sm"
              className="h-7 rounded-lg px-2.5 text-[0.7rem]"
              disabled={busy !== null}
              onClick={() => void handle(listing._id, true)}
            >
              {busy === listing._id ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Onayla
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg px-2.5 text-[0.7rem] text-destructive"
              disabled={busy !== null}
              onClick={() => void handle(listing._id, false)}
            >
              <X className="size-3" /> Reddet
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
