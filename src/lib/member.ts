/**
 * Site üye alanının Convex istemcisi ve ortak tipleri.
 *
 * İlanlar `/app/` içindeki uygulamayla aynı Convex fonksiyonlarını kullanır;
 * burada yalnızca sitenin kendi tasarımıyla çizilen ekranlar için ince bir
 * veri katmanı var. Fonksiyon adları `anyApi` ile çözülür, çünkü site
 * derlemesi Convex tip üretimine ihtiyaç duymaz.
 */
import { anyApi } from "convex/server";

export const api = anyApi;

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site içi mutlak yol. */
export function href(path: string): string {
  return `${BASE}${path}`;
}

/** Giriş sayfasına, dönülecek sayfayı koruyarak yönlendirir. */
export function loginHref(): string {
  if (typeof window === "undefined") return href("/hesap/");
  const back = `${window.location.pathname}${window.location.search}`;
  return `${href("/hesap/")}?donus=${encodeURIComponent(back)}`;
}

export type ListingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "sold"
  | "expired";

export interface MemberUser {
  _id: string;
  name?: string | null;
  email?: string | null;
  role?: "admin" | "user" | "member" | null;
  isAnonymous?: boolean | null;
  emailVerificationTime?: number | null;
}

export interface ListingImage {
  id: string;
  url: string | null;
}

export interface ManagedListing {
  _id: string;
  slug: string;
  title: string;
  description: string;
  sector: string;
  category: "satilik" | "kiralik" | "yedek-parca" | "hizmet";
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  hours?: number | null;
  condition?: "sifir" | "ikinci-el" | "yenilenmis" | null;
  city?: string | null;
  price?: number | null;
  currency?: string | null;
  priceHidden?: boolean | null;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  status: ListingStatus;
  views?: number | null;
  rejectionReason?: string | null;
  createdAt: number;
  cover: string | null;
  gallery: ListingImage[];
}

export interface Quota {
  quota: number;
  used: number;
}

/** `listings.ts` ile birebir aynı sektör adları. */
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

export const CATEGORIES = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
  { value: "yedek-parca", label: "Yedek parça" },
  { value: "hizmet", label: "Hizmet" },
] as const;

export const CONDITIONS = [
  { value: "sifir", label: "Sıfır" },
  { value: "ikinci-el", label: "İkinci el" },
  { value: "yenilenmis", label: "Yenilenmiş" },
] as const;

export const MAX_IMAGES = 8;

export const STATUS: Record<
  ListingStatus,
  { label: string; icon: string; className: string }
> = {
  pending: { label: "Onay bekliyor", icon: "◷", className: "pending" },
  approved: { label: "Yayında", icon: "✓", className: "approved" },
  rejected: { label: "Reddedildi", icon: "✕", className: "rejected" },
  sold: { label: "Satıldı", icon: "•", className: "sold" },
  expired: { label: "Süresi doldu", icon: "•", className: "expired" },
};

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((item) => [item.value, item.label]),
);

export const CONDITION_LABEL: Record<string, string> = Object.fromEntries(
  CONDITIONS.map((item) => [item.value, item.label]),
);

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const numberFormat = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

export function formatDate(value: number): string {
  return dateFormat.format(new Date(value));
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPrice(listing: ManagedListing): string {
  if (listing.priceHidden || listing.price == null) return "Fiyat sorunuz";
  const currency = listing.currency ?? "TRY";
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(listing.price);
  } catch {
    return `${formatNumber(listing.price)} ${currency}`;
  }
}

const SECTOR_SLUGS: Record<string, string> = {
  "İş Makinaları": "is-makinalari",
  Madencilik: "madencilik",
  "Liman & Malzeme Elleçleme": "liman",
  "Tarım Makinaları": "tarim",
  "Araç Üstü Ekipman": "arac-ustu-ekipman",
  "Elektrifikasyon & Dönüşüm": "elektrifikasyon",
  "Marine & Yatçılık": "marine-yatcilik",
  "Havalimanı & GSE": "havaalani-gse",
};

export function listingHref(listing: ManagedListing): string {
  const sector = SECTOR_SLUGS[listing.sector] ?? "diger";
  return href(`/ilanlar/${sector}/${listing.slug}/`);
}

/**
 * Convex'in sunucu izini taşıyan hata metninden yalnızca okunur mesajı alır.
 * Böylece kullanıcı "Uncaught Error: ... at async handler" görmek yerine
 * ilan kuralını görür.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const uncaught = error.message.match(/Uncaught Error:\s*([^\n]+)/);
  if (uncaught?.[1]) return uncaught[1].trim();
  const first = error.message.split("\n")[0].trim();
  if (!first) return fallback;
  return first.replace(/^\[[^\]]*\]\s*/, "") || fallback;
}

/** "2.450.000" ve "2450000,50" gibi girişleri sayıya çevirir. */
export function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
