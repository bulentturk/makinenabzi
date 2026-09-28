import {
  Anchor,
  BatteryCharging,
  Cpu,
  Mountain,
  Newspaper,
  Tractor,
  TrendingUp,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Sectors the makinenabzi.com newsroom publishes into.
 *
 * An article row keeps the newsroom's own tag label, and `categoryMeta` maps
 * that label to an icon and tint — so a brand new tag on the site still renders
 * correctly before it gets bespoke styling here.
 */
export interface SectorMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Badge tint: soft fill + ring, always readable on white cards. */
  tint: string;
  /** Dot / bar colour used in lists and previews. */
  dot: string;
  /** Normalised fragments used to match the newsroom's tag label. */
  keywords: string[];
}

const FALLBACK: SectorMeta = {
  label: "Haberler",
  description: "Makine Nabzı editoryal onayından geçmiş haberler.",
  icon: Newspaper,
  tint: "bg-secondary text-secondary-foreground ring-border",
  dot: "bg-primary",
  keywords: [],
};

export const SECTORS: SectorMeta[] = [
  {
    label: "İş Makinaları",
    description:
      "Ekskavatör, yükleyici, mikser ve şantiye ekipmanlarında yeni modeller.",
    icon: Truck,
    tint: "bg-amber-500/12 text-amber-700 ring-amber-500/20",
    dot: "bg-amber-500",
    keywords: ["ismakina", "isekipmani"],
  },
  {
    label: "Madencilik",
    description: "Açık ocak, yeraltı ve cevher taşıma ekipmanları.",
    icon: Mountain,
    tint: "bg-stone-500/12 text-stone-700 ring-stone-500/20",
    dot: "bg-stone-500",
    keywords: ["maden"],
  },
  {
    label: "Liman & Elleçleme",
    description: "Vinç, reach stacker ve liman sahası operasyonları.",
    icon: Anchor,
    tint: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/20",
    dot: "bg-cyan-500",
    keywords: ["liman", "ellecleme", "lojistik"],
  },
  {
    label: "Tarım Makineleri",
    description: "Traktör, hasat ve tarımsal mekanizasyon teknolojileri.",
    icon: Tractor,
    tint: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
    dot: "bg-emerald-500",
    keywords: ["tarim", "traktor"],
  },
  {
    label: "Araç Üstü Ekipman",
    description: "Kamyon üstü vinç, platform ve özel amaçlı üstyapılar.",
    icon: Wrench,
    tint: "bg-sky-500/12 text-sky-700 ring-sky-500/20",
    dot: "bg-sky-500",
    keywords: ["aracustu", "ustyapi"],
  },
  {
    label: "Elektrifikasyon",
    description: "Batarya, e-motor, inverter ve şarj altyapısı.",
    icon: BatteryCharging,
    tint: "bg-teal-500/12 text-teal-700 ring-teal-500/20",
    dot: "bg-teal-500",
    keywords: ["elektrifik", "batarya", "sarj", "elektrik"],
  },
  {
    label: "Yatırım & İş Birliği",
    description: "Satın almalar, tesis yatırımları ve teknoloji ortaklıkları.",
    icon: TrendingUp,
    tint: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/20",
    dot: "bg-indigo-500",
    keywords: ["yatirim", "isbirligi", "ortaklik", "satinalma"],
  },
  {
    label: "Teknoloji",
    description: "Otonom sistemler, telemetri ve saha dijitalleşmesi.",
    icon: Cpu,
    tint: "bg-violet-500/12 text-violet-700 ring-violet-500/20",
    dot: "bg-violet-500",
    keywords: ["teknoloji", "otonom", "yazilim"],
  },
];

export const ALL_CATEGORIES_LABEL = "Tümü";

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıİ]/g, "i")
    .replace(/[^a-z0-9]/g, "");
}

/** Icon + tint for a newsroom tag label; unknown tags keep their own label. */
export function categoryMeta(label: string): SectorMeta {
  if (!label) return FALLBACK;

  const exact = SECTORS.find((sector) => sector.label === label);
  if (exact) return exact;

  const key = normalize(label);
  const matched = SECTORS.find((sector) =>
    sector.keywords.some((keyword) => key.includes(keyword)),
  );
  if (matched) return { ...matched, label };

  return { ...FALLBACK, label };
}

const relativeTime = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });
const shortDate = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
});
const clockTime = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = timestamp - now;
  const abs = Math.abs(diff);

  if (abs < 60_000) return "az önce";
  if (abs < 3_600_000) {
    return relativeTime.format(Math.round(diff / 60_000), "minute");
  }
  if (abs < 86_400_000) {
    return relativeTime.format(Math.round(diff / 3_600_000), "hour");
  }
  if (abs < 7 * 86_400_000) {
    return relativeTime.format(Math.round(diff / 86_400_000), "day");
  }
  return shortDate.format(new Date(timestamp));
}

export function formatClock(timestamp: number): string {
  return clockTime.format(new Date(timestamp));
}

/** Stories newer than this get the "yeni" marker in the timeline. */
export const FRESH_WINDOW_MS = 6 * 3_600_000;

export function isFresh(timestamp: number, now = Date.now()): boolean {
  return now - timestamp < FRESH_WINDOW_MS;
}

export const DIGEST_OPTIONS = [
  {
    value: "instant",
    label: "Anında",
    description: "Haber yayına girdiği an bildirim gider.",
  },
  {
    value: "daily",
    label: "Günlük özet",
    description: "Her sabah 08:00'de seçtiğiniz sektörlerin özeti.",
  },
  {
    value: "weekly",
    label: "Haftalık özet",
    description: "Pazartesi sabahı haftanın makine gündemi.",
  },
  {
    value: "off",
    label: "Kapalı",
    description: "Bildirim gönderilmez, uygulamadan takip edersiniz.",
  },
] as const;

export type DigestValue = (typeof DIGEST_OPTIONS)[number]["value"];

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: `${String(hour).padStart(2, "0")}:00`,
}));
