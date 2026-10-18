import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { ImagePlus, Loader2, ShieldAlert, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

/**
 * İlan formu — hem yeni ilan hem de düzenleme için kullanılır.
 *
 * Sunucu tarafı `listings:create` / `listings:update` yetkiyi ve kotayı
 * kendisi denetler; buradaki kontroller yalnızca kullanıcıyı erken uyarır.
 * Fotoğraflar Convex depolamaya yüklenir, ilana yalnızca `_storage` kimliği
 * yazılır.
 */

export const SECTORS = [
  "İş Makinaları",
  "Madencilik",
  "Liman & Malzeme Elleçleme",
  "Tarım Makinaları",
  "Araç Üstü Ekipman",
  "Elektrifikasyon & Dönüşüm",
  "Marine & Yatçılık",
  "Havalimanı & GSE",
] as const;

const CATEGORIES = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
  { value: "yedek-parca", label: "Yedek parça" },
  { value: "hizmet", label: "Hizmet" },
] as const;

const CONDITIONS = [
  { value: "sifir", label: "Sıfır" },
  { value: "ikinci-el", label: "İkinci el" },
  { value: "yenilenmis", label: "Yenilenmiş" },
] as const;

const MAX_IMAGES = 8;

type Category = (typeof CATEGORIES)[number]["value"];
type Condition = (typeof CONDITIONS)[number]["value"];

type UploadedImage = { id: Id<"_storage">; preview: string };

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.75rem] font-semibold text-foreground">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[0.7rem] leading-snug text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function ListingForm({
  listing,
  onSaved,
  onCancel,
}: {
  /** Doluysa düzenleme modu. */
  listing?: Doc<"listings"> & { gallery?: { id: Id<"_storage">; url: string | null }[] };
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const create = useMutation(api.listings.create);
  const update = useMutation(api.listings.update);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);
  const quota = useQuery(api.listings.myQuota);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [sector, setSector] = useState<string>(listing?.sector ?? SECTORS[0]);
  const [category, setCategory] = useState<Category>(
    (listing?.category as Category) ?? "satilik",
  );
  const [condition, setCondition] = useState<Condition | "">(
    (listing?.condition as Condition) ?? "",
  );
  const [brand, setBrand] = useState(listing?.brand ?? "");
  const [model, setModel] = useState(listing?.model ?? "");
  const [year, setYear] = useState(listing?.year ? String(listing.year) : "");
  const [hours, setHours] = useState(
    listing?.hours !== undefined ? String(listing.hours) : "",
  );
  const [city, setCity] = useState(listing?.city ?? "");
  const [price, setPrice] = useState(
    listing?.price !== undefined ? String(listing.price) : "",
  );
  const [priceHidden, setPriceHidden] = useState(
    listing?.priceHidden ?? false,
  );
  const [contactName, setContactName] = useState(
    listing?.contactName ?? user?.name ?? "",
  );
  const [contactPhone, setContactPhone] = useState(listing?.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(
    listing?.contactEmail ?? user?.email ?? "",
  );

  const [images, setImages] = useState<UploadedImage[]>(
    (listing?.gallery ?? [])
      .filter((image) => image.url)
      .map((image) => ({ id: image.id, preview: image.url as string })),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(listing);
  const verified = Boolean(user && !user.isAnonymous && user.emailVerificationTime);
  const quotaFull = quota ? quota.used >= quota.quota : false;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`En fazla ${MAX_IMAGES} fotoğraf ekleyebilirsiniz.`);
      return;
    }
    const selected = Array.from(files).slice(0, room);
    setIsUploading(true);
    setError(null);
    try {
      for (const file of selected) {
        if (file.size > 6 * 1024 * 1024) {
          throw new Error(`${file.name} 6 MB sınırını aşıyor.`);
        }
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!response.ok) throw new Error("Fotoğraf yüklenemedi.");
        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };
        setImages((current) => [
          ...current,
          { id: storageId, preview: URL.createObjectURL(file) },
        ]);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Fotoğraf yüklenemedi.",
      );
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeImage(id: Id<"_storage">) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 10) {
      setError("Başlık en az 10 karakter olmalı.");
      return;
    }
    if (description.trim().length < 50) {
      setError("Açıklama en az 50 karakter olmalı.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setError("İletişim adı ve telefonu zorunludur.");
      return;
    }

    const priceValue = priceHidden ? undefined : toNumber(price);
    if (!priceHidden && price.trim() && priceValue === undefined) {
      setError("Fiyat sayı olmalı.");
      return;
    }

    setIsSaving(true);
    try {
      if (listing) {
        await update({
          listingId: listing._id,
          title,
          description,
          sector,
          category,
          price: priceHidden ? undefined : priceValue,
          priceHidden,
          city: city.trim() || undefined,
          contactName,
          contactPhone,
          images: images.map((image) => image.id),
        });
        toast.success("İlan güncellendi", {
          description: "Değişiklikler editör onayından sonra yayına alınır.",
        });
      } else {
        await create({
          title,
          description,
          sector,
          category,
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          year: toNumber(year),
          hours: toNumber(hours),
          condition: condition || undefined,
          city: city.trim() || undefined,
          price: priceValue,
          priceHidden,
          contactName,
          contactPhone,
          contactEmail: contactEmail.trim() || undefined,
          images: images.map((image) => image.id),
        });
        toast.success("İlan onaya gönderildi", {
          description: "Editör onayından sonra ilanlar sayfasında yayınlanır.",
        });
      }
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "İlan kaydedilemedi.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!verified && !listing) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldAlert className="size-4.5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              E-posta doğrulaması gerekiyor
            </h2>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
              İlan verebilmek için e-posta adresinizle giriş yapmalısınız.
              Misafir hesaplar yalnızca gezinir; ilan yayınlayamaz.
            </p>
            <Button asChild size="sm" className="mt-3 rounded-xl">
              <Link to="/auth?returnTo=%2Fdashboard">E-posta ile giriş yap</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
    >
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight">
          {isEditing ? "İlanı düzenle" : "Yeni ilan"}
        </h2>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
          {isEditing
            ? "Kaydettiğinizde ilan yeniden editör onayına gider."
            : `İlan 60 gün yayında kalır. Onaydan sonra sitenin ilanlar bölümünde listelenir.`}
        </p>
      </div>

      {quota && !isEditing && (
        <p className="rounded-xl bg-secondary px-3 py-2 text-[0.75rem] font-medium text-muted-foreground">
          Aktif ilan hakkı: {quota.used}/{quota.quota}
        </p>
      )}

      <Field label="Başlık" hint="Marka, model ve yıl en başta olsun.">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="2021 Komatsu PC210 LC-11 paletli ekskavatör"
          required
          minLength={10}
        />
      </Field>

      <Field label="Açıklama" hint="En az 50 karakter. Bakım geçmişi, kullanım ve kusur bilgisi verin.">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          required
          minLength={50}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] md:text-sm"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sektör">
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="İlan tipi">
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as Category)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Marka">
          <Input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Komatsu"
            disabled={isEditing}
          />
        </Field>
        <Field label="Model">
          <Input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="PC210"
            disabled={isEditing}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Model yılı">
          <Input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            inputMode="numeric"
            placeholder="2021"
            disabled={isEditing}
          />
        </Field>
        <Field label="Çalışma saati">
          <Input
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            inputMode="numeric"
            placeholder="8.400"
            disabled={isEditing}
          />
        </Field>
        <Field label="Durum">
          <Select
            value={condition || "belirtilmedi"}
            onValueChange={(value) =>
              setCondition(value === "belirtilmedi" ? "" : (value as Condition))
            }
            disabled={isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="belirtilmedi">Belirtilmedi</SelectItem>
              {CONDITIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Konum">
          <Input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ankara"
          />
        </Field>
        <Field
          label="Fiyat (TRY)"
          hint="Fiyat vermek istemiyorsanız aşağıdaki kutuyu işaretleyin."
        >
          <Input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="numeric"
            placeholder="2.450.000"
            disabled={priceHidden}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
        <input
          type="checkbox"
          checked={priceHidden}
          onChange={(event) => setPriceHidden(event.target.checked)}
          className="size-4 rounded border-input"
        />
        Fiyatı gizle, “fiyat sorunuz” yazsın
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="İletişim adı">
          <Input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            required
          />
        </Field>
        <Field label="Telefon" hint="Numba yalnızca ilan sayfasında “Göster” ile açılır.">
          <Input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            inputMode="tel"
            placeholder="0532 000 00 00"
            required
          />
        </Field>
      </div>

      {!isEditing && (
        <Field label="E-posta (isteğe bağlı)">
          <Input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
          />
        </Field>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[0.75rem] font-semibold">
          Fotoğraflar ({images.length}/{MAX_IMAGES})
        </span>
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.preview}
                alt=""
                className="size-20 rounded-xl border border-border/70 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                aria-label="Fotoğrafı kaldır"
                className="absolute -top-1.5 -right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={isUploading}
              className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-[0.65rem] font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Ekle
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[0.78rem] font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isSaving || isUploading || (!isEditing && quotaFull)}
          className="rounded-xl"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isEditing ? "Değişiklikleri kaydet" : "Onaya gönder"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={onCancel}
          >
            Vazgeç
          </Button>
        )}
        {!isEditing && quotaFull && (
          <span className="self-center text-[0.75rem] text-muted-foreground">
            Aktif ilan hakkınız dolu. Önce bir ilanı kapatın.
          </span>
        )}
      </div>
    </form>
  );
}

