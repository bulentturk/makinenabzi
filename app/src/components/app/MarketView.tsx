import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Flag,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Store,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListingForm, SECTORS } from "./ListingForm";
import { MyListingsView, type ManagedListing } from "./MyListingsView";

const CATEGORY_FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
  { value: "yedek-parca", label: "Yedek parça" },
  { value: "hizmet", label: "Hizmet" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  satilik: "Satılık",
  kiralik: "Kiralık",
  "yedek-parca": "Yedek parça",
  hizmet: "Hizmet",
};

const REPORT_REASONS = [
  "Yanıltıcı bilgi",
  "Satılmış / artık geçerli değil",
  "Başka bir ilandan kopyalanmış",
  "Uygunsuz içerik",
];

const priceFormat = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

function PriceTag({
  price,
  currency,
  hidden,
}: {
  price: number | null;
  currency: string;
  hidden: boolean;
}) {
  if (hidden || price === null) {
    return <span className="text-[0.85rem] font-semibold text-primary">Fiyat sorunuz</span>;
  }
  return (
    <span className="text-[0.85rem] font-semibold text-primary">
      {priceFormat.format(price)} {currency === "TRY" ? "₺" : currency}
    </span>
  );
}

function ListingDetail({
  listing,
  onClose,
}: {
  listing: ManagedListing;
  onClose: () => void;
}) {
  const report = useMutation(api.listings.report);
  const [showPhone, setShowPhone] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [isSending, setIsSending] = useState(false);

  const specs = [
    ["Marka", listing.brand],
    ["Model", listing.model],
    ["Yıl", listing.year ? String(listing.year) : null],
    [
      "Çalışma saati",
      listing.hours !== undefined
        ? `${priceFormat.format(listing.hours)} saat`
        : null,
    ],
    ["Konum", listing.city],
    ["İlan tipi", CATEGORY_LABELS[listing.category] ?? listing.category],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  async function handleReport() {
    setIsSending(true);
    try {
      await report({ listingId: listing._id, reason });
      toast.success("Şikayet iletildi", {
        description: "Editör ekibi ilanı inceleyecek.",
      });
      setReason(REPORT_REASONS[0]);
    } catch (error) {
      toast.error("Şikayet gönderilemedi", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {listing.gallery.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(listing.gallery.length > 1 ? listing.gallery : []).map((image) => (
            <img
              key={image.id}
              src={image.url ?? ""}
              alt=""
              className="size-24 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
          ))}
          {listing.gallery.length === 1 && (
            <img
              src={listing.gallery[0].url ?? ""}
              alt=""
              className="h-36 w-full rounded-xl object-cover"
              loading="lazy"
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </span>
        <span className="text-[0.7rem] text-muted-foreground">{listing.sector}</span>
        {listing.city && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
            <MapPin className="size-3" /> {listing.city}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg leading-snug font-semibold tracking-tight">
          {listing.title}
        </h2>
        <PriceTag
          price={listing.price ?? null}
          currency={listing.currency ?? "TRY"}
          hidden={Boolean(listing.priceHidden)}
        />
      </div>

      {specs.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl bg-secondary/60 p-3">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </dt>
              <dd className="text-[0.78rem] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="space-y-2 text-[0.8rem] leading-relaxed text-muted-foreground">
        {listing.description
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>

      <div className="rounded-xl border border-border/70 p-3">
        <p className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
          İlan sahibi
        </p>
        <p className="mt-0.5 text-[0.82rem] font-semibold">{listing.contactName}</p>
        {showPhone ? (
          <a
            href={`tel:${listing.contactPhone.replace(/\s/g, "")}`}
            className="mt-1 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-primary"
          >
            <Phone className="size-3.5" /> {listing.contactPhone}
          </a>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="mt-1.5 h-7 rounded-lg px-2.5 text-[0.7rem]"
            onClick={() => setShowPhone(true)}
          >
            <Phone className="size-3" /> Numarayı göster
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger size="sm" className="h-7 text-[0.7rem]">
            <Flag className="size-3" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-lg px-2 text-[0.7rem] text-muted-foreground"
          disabled={isSending}
          onClick={() => void handleReport()}
        >
          {isSending && <Loader2 className="size-3 animate-spin" />}
          Şikayet et
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-7 rounded-lg px-2 text-[0.7rem]"
          onClick={onClose}
        >
          Kapat
        </Button>
      </div>
    </>
  );
}

function BrowseView({
  onOpen,
  isEditor,
}: {
  onOpen: (listing: ManagedListing) => void;
  isEditor: boolean;
}) {
  const [sector, setSector] = useState("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const listings = useQuery(api.listings.listApproved, {
    limit: 60,
    sector: sector === "all" ? undefined : sector,
    category:
      category === "all"
        ? undefined
        : (category as "satilik" | "kiralik" | "yedek-parca" | "hizmet"),
    search: search.trim() || undefined,
  });
  const stats = useQuery(api.listings.sectorStats);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
          <Store className="size-3" />
          Makine pazarı
        </span>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          İlanlar
        </h1>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          {stats && stats.total > 0
            ? `${stats.total} yayında ilan. Her ilan editör onayından geçer; iletişim doğrudan satıcıyla kurulur.`
            : "İlanlar editör onayından sonra burada listelenir. İlk ilanı siz verebilirsiniz."}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Marka, model veya şehir ara"
          className="h-9 pl-9 text-[0.8rem]"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CATEGORY_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCategory(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[0.72rem] font-semibold transition-colors",
              category === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Select value={sector} onValueChange={setSector}>
        <SelectTrigger size="sm" className="w-full text-[0.78rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm sektörler</SelectItem>
          {SECTORS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {listings === undefined ? (
        <p className="text-[0.8rem] text-muted-foreground">İlanlar yükleniyor…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="text-[0.85rem] font-semibold">
            {search || sector !== "all" || category !== "all"
              ? "Aramanıza uygun ilan yok."
              : "Henüz yayınlanmış ilan yok."}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground">
            {isEditor
              ? "İlanlarınız sekmesindeki moderasyon kuyruğundan bekleyen ilanları onaylayabilirsiniz."
              : "İlanlar onaydan sonra burada görünür. Makinenizi listelemek için İlanlarım bölümünü kullanın."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {listings.map((listing) => (
            <button
              key={listing._id}
              type="button"
              onClick={() => onOpen(listing as ManagedListing)}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-soft transition-colors hover:border-primary/50"
            >
              {listing.cover ? (
                <img
                  src={listing.cover}
                  alt=""
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-secondary text-[0.7rem] text-muted-foreground">
                  Fotoğraf yok
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-muted-foreground">
                  <span className="rounded-full bg-secondary px-1.5 py-0.5">
                    {CATEGORY_LABELS[listing.category] ?? listing.category}
                  </span>
                  {listing.city && <span>{listing.city}</span>}
                </div>
                <h3 className="mt-1 line-clamp-2 text-[0.82rem] leading-snug font-semibold">
                  {listing.title}
                </h3>
                <div className="mt-1.5">
                  <PriceTag
                    price={listing.price ?? null}
                    currency={listing.currency ?? "TRY"}
                    hidden={Boolean(listing.priceHidden)}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarketView({ isEditor }: { isEditor: boolean }) {
  const [mode, setMode] = useState<"vitrin" | "form" | "benim">("vitrin");
  const [detail, setDetail] = useState<ManagedListing | null>(null);
  const [editing, setEditing] = useState<ManagedListing | null>(null);

  function openCreate() {
    setEditing(null);
    setMode("form");
  }

  function openEdit(listing: ManagedListing) {
    setEditing(listing);
    setMode("form");
  }

  return (
    <div className="flex flex-col gap-4">
      {mode !== "vitrin" && (
        <button
          type="button"
          onClick={() => setMode("vitrin")}
          className="inline-flex items-center gap-1.5 self-start rounded-lg px-1 py-0.5 text-[0.78rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Pazara dön
        </button>
      )}

      {mode === "vitrin" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setMode("benim")}
            >
              İlanlarım
            </Button>
            <Button size="sm" className="flex-1 rounded-xl" onClick={openCreate}>
              <Plus className="size-4" /> İlan ver
            </Button>
          </div>
          <BrowseView
            isEditor={isEditor}
            onOpen={(listing) => setDetail(listing)}
          />
        </div>
      )}

      {mode === "benim" && (
        <MyListingsView
          isEditor={isEditor}
          onNew={openCreate}
          onEdit={openEdit}
        />
      )}

      {mode === "form" && (
        <ListingForm
          listing={editing ?? undefined}
          onSaved={() => {
            setEditing(null);
            setMode("benim");
          }}
          onCancel={() => {
            setEditing(null);
            setMode("benim");
          }}
        />
      )}

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">İlan detayı</DialogTitle>
            <DialogDescription className="sr-only">
              İlan bilgileri ve satıcı iletişimi
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <ListingDetail
              listing={detail as ManagedListing & { _id: Id<"listings"> }}
              onClose={() => setDetail(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
