/**
 * Editorial reference data mirrored from the makinenabzi.com repository.
 *
 * Everything here is copied from the newsroom repo so the app and the site
 * share one source of truth:
 *   - `FAIRS`            <- src/data/events.ts
 *   - `ACTIVE_SOURCES`   <- agent/sources.json (the feeds the news agent reads)
 *   - `WATCHLIST`        <- agent/source-catalog.json (feeds still being vetted)
 *   - `REFERENCE_POOL`   <- src/pages/kaynaklar.astro (research & verification pool)
 *
 * Only the public metadata is mirrored: no article text, no draft content.
 */

export type FairImportance = "high" | "medium";

export interface FairSeed {
  name: string;
  /** ISO date, `YYYY-MM-DD`. */
  start: string;
  /** ISO date, or null when the organiser has not confirmed an end day. */
  end: string | null;
  /** Shown instead of a date range when only the month/year is confirmed. */
  dateLabel?: string;
  city: string;
  country: string;
  sector: string;
  focus: string;
  url: string;
  importance: FairImportance;
}

/**
 * Verified fair & event calendar.
 * Policy from the newsroom: never invent an estimate for an unconfirmed date —
 * the event is marked "tarih açıklanacak" instead.
 */
export const FAIRS: FairSeed[] = [
  {
    name: "MAKTEK Avrasya 2026",
    start: "2026-09-28",
    end: "2026-10-03",
    city: "İstanbul",
    country: "Türkiye",
    sector: "Üretim & Komponent",
    focus: "Takım tezgahları, üretim teknolojileri ve makine imalat altyapısı",
    url: "https://www.tuyap.com.tr/",
    importance: "medium",
  },
  {
    name: "IBEX 2026",
    start: "2026-10-06",
    end: "2026-10-08",
    city: "Tampa",
    country: "ABD",
    sector: "Marine & Yatçılık",
    focus: "Tekne üretimi, marine komponentleri, elektrikli tahrik, yeni ürünler",
    url: "https://www.ibexshow.com/",
    importance: "high",
  },
  {
    name: "IMARC 2026",
    start: "2026-10-27",
    end: "2026-10-29",
    city: "Sydney",
    country: "Avustralya",
    sector: "Madencilik",
    focus: "Maden makineleri, operasyon teknolojileri, otonomi, elektrifikasyon ve yatırım",
    url: "https://imarcglobal.com/",
    importance: "high",
  },
  {
    name: "Fort Lauderdale International Boat Show 2026",
    start: "2026-10-28",
    end: "2026-11-01",
    city: "Fort Lauderdale",
    country: "ABD",
    sector: "Marine & Yatçılık",
    focus: "Yatlar, marine teknolojileri, aksesuar ve yeni ürün lansmanları",
    url: "https://www.flibs.com/",
    importance: "medium",
  },
  {
    name: "electronica 2026",
    start: "2026-11-10",
    end: "2026-11-13",
    city: "Münih",
    country: "Almanya",
    sector: "Elektronik & Komponent",
    focus:
      "Güç elektroniği, embedded sistemler, bağlantılı makineler, sensörler ve elektronik komponentler",
    url: "https://electronica.de/en/",
    importance: "high",
  },
  {
    name: "EIMA International 2026",
    start: "2026-11-10",
    end: "2026-11-14",
    city: "Bologna",
    country: "İtalya",
    sector: "Tarım Makinaları",
    focus:
      "Tarım ve bahçe makineleri, teknik inovasyon, komponent ve dijital tarım",
    url: "https://www.eima.it/en/",
    importance: "high",
  },
  {
    name: "METSTRADE 2026",
    start: "2026-11-17",
    end: "2026-11-19",
    city: "Amsterdam",
    country: "Hollanda",
    sector: "Marine & Yatçılık",
    focus:
      "Leisure marine ekipmanları, komponentler, sistemler, DAME Design Awards",
    url: "https://www.metstrade.com/",
    importance: "high",
  },
  {
    name: "bauma CHINA 2026",
    start: "2026-11-23",
    end: "2026-11-27",
    city: "Şanghay",
    country: "Çin",
    sector: "İş Makinaları & Madencilik",
    focus:
      "İş makineleri, maden makineleri, yeni enerji, otomasyon ve yeşil teknolojiler",
    url: "https://bauma-china.com/en/",
    importance: "high",
  },
  {
    name: "Growtech Antalya 2026",
    start: "2026-11-24",
    end: "2026-11-27",
    city: "Antalya",
    country: "Türkiye",
    sector: "Tarım Teknolojileri",
    focus: "Sera teknolojileri, tarım inovasyonu, ekipman ve startup ekosistemi",
    url: "https://www.growtech.com.tr/",
    importance: "high",
  },
  {
    name: "boot Düsseldorf 2027",
    start: "2027-01-23",
    end: "2027-01-31",
    city: "Düsseldorf",
    country: "Almanya",
    sector: "Marine & Yatçılık",
    focus:
      "Tekne ve yatlar, marine ekipmanları, propulsion ve yeni teknolojiler",
    url: "https://www.boot.com/",
    importance: "high",
  },
  {
    name: "HAFTEK 2027",
    start: "2027-03-17",
    end: "2027-03-20",
    city: "İstanbul",
    country: "Türkiye",
    sector: "İş Makinaları",
    focus: "Saha gereksinimleri, yeni nesil makineler ve teknoloji",
    url: "https://haftekfuar.com.tr/",
    importance: "medium",
  },
  {
    name: "The Future of Refit 2027",
    start: "2027-03-31",
    end: "2027-04-02",
    city: "Monako",
    country: "Monako",
    sector: "Marine & Yatçılık",
    focus: "Superyacht refit, bakım, servis ve yeni teknoloji çözümleri",
    url: "https://www.monacoyachtshow.com/en/futurefit-announcement-press-release",
    importance: "medium",
  },
  {
    name: "HANNOVER MESSE 2027",
    start: "2027-04-05",
    end: "2027-04-08",
    city: "Hannover",
    country: "Almanya",
    sector: "Endüstriyel Teknoloji",
    focus:
      "Automation, Motion & Drives, enerji, industrial AI, komponent ve üretim teknolojileri",
    url: "https://www.hannovermesse.de/",
    importance: "high",
  },
  {
    name: "INTERMAT 2027",
    start: "2027-04-21",
    end: "2027-04-24",
    city: "Paris",
    country: "Fransa",
    sector: "İş Makinaları",
    focus:
      "İnşaat makineleri, düşük karbon teknolojileri, ekipman ve inovasyon",
    url: "https://www.intermatconstruction.com/",
    importance: "high",
  },
  {
    name: "KOMATEK Diyarbakır 2027",
    start: "2027-05-04",
    end: "2027-05-08",
    city: "Diyarbakır",
    country: "Türkiye",
    sector: "İş Makinaları & Madencilik",
    focus: "İş makineleri, malzeme elleçleme ve maden makineleri",
    url: "https://komatekfuar.com/",
    importance: "high",
  },
  {
    name: "iVT Expo 2027",
    start: "2027-06-09",
    end: "2027-06-10",
    city: "Köln",
    country: "Almanya",
    sector: "Off-Highway Teknolojileri",
    focus:
      "Elektrifikasyon, hidrolik, kontrol, otonomi, sensör ve komponentler",
    url: "https://ivtexpo.com/",
    importance: "high",
  },
  {
    name: "Monaco Energy Boat Challenge 2027",
    start: "2027-06-29",
    end: "2027-07-03",
    city: "Monako",
    country: "Monako",
    sector: "Marine & Yatçılık",
    focus:
      "Yeni enerji sistemleri, elektrikli/hidrojenli tekneler ve marine inovasyonu",
    url: "https://monacoenergyboatchallenge.com/",
    importance: "medium",
  },
  {
    name: "AGRITECHNICA 2027",
    start: "2027-11-14",
    end: "2027-11-20",
    city: "Hannover",
    country: "Almanya",
    sector: "Tarım Makinaları",
    focus:
      "Tarım makineleri, powertrain, hidrolik, elektronik, sensör, yazılım ve otomasyon",
    url: "https://www.agritechnica.com/",
    importance: "high",
  },
  {
    name: "bauma 2028",
    start: "2028-04-03",
    end: "2028-04-09",
    city: "Münih",
    country: "Almanya",
    sector: "İş Makinaları & Madencilik",
    focus: "İş makineleri, maden makineleri, inşaat araçları ve teknoloji",
    url: "https://bauma.de/en/",
    importance: "high",
  },
  {
    name: "Maden Türkiye 2028",
    start: "2028-05-11",
    end: "2028-05-14",
    city: "İstanbul",
    country: "Türkiye",
    sector: "Madencilik",
    focus: "Madencilik, tünel, makine ekipmanları ve iş makineleri",
    url: "https://tuyap.com.tr/fuarlar/maden-turkiye",
    importance: "high",
  },
  {
    name: "KOMATEK 2028",
    start: "2028-06-01",
    end: null,
    dateLabel: "Haziran 2028 — kesin günler açıklanacak",
    city: "İstanbul",
    country: "Türkiye",
    sector: "İş Makinaları",
    focus: "İş ve inşaat makineleri, teknoloji ve ekipman",
    url: "https://komatekfuar.com/",
    importance: "high",
  },
  {
    name: "GSE Expo Europe 2028",
    start: "2028-09-01",
    end: null,
    dateLabel: "2028 — kesin tarih açıklanacak",
    city: "Açıklanacak",
    country: "Avrupa",
    sector: "Havalimanı & GSE",
    focus:
      "Ground support equipment, elektrikli GSE, şarj, apron ve yer hizmetleri teknolojileri",
    url: "https://www.gse-expo-europe.com/",
    importance: "high",
  },
  {
    name: "CONEXPO-CON/AGG 2029",
    start: "2029-03-13",
    end: "2029-03-17",
    city: "Las Vegas",
    country: "ABD",
    sector: "İş Makinaları",
    focus:
      "İnşaat, agrega, beton, earthmoving, lifting, mining ve teknoloji",
    url: "https://www.conexpoconagg.com/",
    importance: "high",
  },
];

export type SourceKind =
  | "industry_media"
  | "technical_media"
  | "press_release_wire"
  | "event_source"
  | "association"
  | "institution";

export type SourceStatus =
  | "active-rss"
  | "watchlist"
  | "watchlist-priority"
  | "needs-verification"
  | "event-watch"
  | "reference";

export interface SourceSeed {
  key: string;
  name: string;
  url?: string;
  feedUrl?: string;
  kind: SourceKind;
  status: SourceStatus;
  group: string;
  sector?: string;
  focus: string[];
  priority: number;
  origin: "agent" | "kaynaklar";
}

/** Groups the Kaynaklar screen renders, in this order. */
export const ACTIVE_GROUP = "Aktif takip (RSS)";
export const WATCHLIST_GROUP = "İzleme listesi";
export const EVENT_GROUP = "Etkinlik kaynakları";

/** `[name, homepage, feed, kind, status, sector, priority]` */
type ActiveRow = [
  string,
  string,
  string,
  SourceKind,
  SourceStatus,
  string,
  number,
];

/**
 * The eight RSS feeds the news agent actually scans (agent/sources.json).
 * These are what makes the feed multi-source: every published story carries
 * the outlet it was verified against.
 */
export const ACTIVE_SOURCES: ActiveRow[] = [
  [
    "International Mining",
    "https://im-mining.com/",
    "https://im-mining.com/feed/",
    "industry_media",
    "active-rss",
    "Madencilik",
    100,
  ],
  [
    "iVT International",
    "https://www.ivtinternational.com/",
    "https://www.ivtinternational.com/feed",
    "technical_media",
    "active-rss",
    "İş Makinaları",
    100,
  ],
  [
    "electrive",
    "https://www.electrive.com/",
    "https://www.electrive.com/feed/",
    "industry_media",
    "active-rss",
    "Elektrifikasyon",
    90,
  ],
  [
    "Charged EVs",
    "https://chargedevs.com/",
    "https://chargedevs.com/feed/",
    "technical_media",
    "active-rss",
    "Elektrifikasyon",
    90,
  ],
  [
    "Port Strategy",
    "https://www.portstrategy.com/",
    "https://www.portstrategy.com/feed",
    "industry_media",
    "active-rss",
    "Liman & Elleçleme",
    90,
  ],
  [
    "Teknikport",
    "https://www.teknikport.com/",
    "https://www.teknikport.com/feed/",
    "technical_media",
    "active-rss",
    "İş Makinaları",
    82,
  ],
  [
    "Construction Equipment Guide",
    "https://www.constructionequipmentguide.com/",
    "https://feeds.feedburner.com/ceg",
    "industry_media",
    "active-rss",
    "İş Makinaları",
    80,
  ],
  [
    "Tunnels & Tunnelling",
    "https://www.tunnelsandtunnelling.com/",
    "https://www.tunnelsandtunnelling.com/feed/",
    "industry_media",
    "active-rss",
    "Madencilik",
    76,
  ],
];

/** `[name, homepage, kind, status, sector, focus, priority]` */
type WatchRow = [string, string, SourceKind, SourceStatus, string, string, number];

/** Catalogued outlets that still need a verified automated feed. */
export const WATCHLIST_SOURCES: WatchRow[] = [
  ["OEM Off-Highway", "https://www.oemoffhighway.com/", "technical_media", "watchlist-priority", "İş Makinaları", "off-highway, drivetrain, hidrolik, elektrifikasyon, sensör, elektronik", 100],
  ["Power & Motion", "https://www.powermotiontech.com/", "technical_media", "watchlist-priority", "Araç Üstü Ekipman", "hidrolik, pnömatik, elektrikli tahrik, motion control, komponent", 100],
  ["Off-Highway", "https://www.offhighway.com/", "industry_media", "watchlist", "İş Makinaları", "off-highway, mobil makine, komponent, elektrifikasyon", 100],
  ["Mining Technology", "https://www.mining-technology.com/", "industry_media", "watchlist", "Madencilik", "madencilik, ekipman, teknoloji", 95],
  ["Ground Handling International", "https://www.groundhandling.com/", "industry_media", "watchlist", "Havalimanı & GSE", "havaalanı GSE, elektrifikasyon, yer hizmetleri", 90],
  ["GSE Expo Europe", "https://www.gse-expo-europe.com/", "event_source", "event-watch", "Havalimanı & GSE", "GSE, ürün lansmanı, etkinlik", 88],
  ["Forum Makine", "", "industry_media", "needs-verification", "İş Makinaları", "iş makinaları, Türkiye", 85],
  ["Vehicle Dynamics International", "https://www.vehicledynamicsinternational.com/", "technical_media", "watchlist", "İş Makinaları", "şasi, steer-by-wire, sensör, test, simülasyon", 72],
  ["EV Magazine", "https://evmagazine.com/", "industry_media", "watchlist", "Elektrifikasyon", "elektrifikasyon, batarya, şarj, enerji", 72],
  ["MAG Update", "https://www.magupdate.co.uk/", "industry_media", "watchlist", "İş Makinaları", "machinery, construction, lifting, industrial", 70],
  ["Elektor", "https://www.elektormagazine.com/", "technical_media", "watchlist", "Elektrifikasyon", "elektronik, embedded, sensör, haberleşme, kontrol", 68],
  ["Control Design", "https://www.controldesign.com/", "technical_media", "watchlist", "Teknoloji", "kontrol, otomasyon, endüstriyel ağ, fonksiyonel güvenlik", 75],
  ["EV Europe", "https://eveurope.eu/", "industry_media", "watchlist", "Elektrifikasyon", "elektrifikasyon, Avrupa", 65],
  ["GlobeNewswire", "https://www.globenewswire.com/", "press_release_wire", "watchlist", "Yatırım & İş Birliği", "ürün lansmanı, şirket duyurusu", 55],
];

/**
 * Research & verification pool, kept exactly as the newsroom groups it on
 * /kaynaklar/. `null` means the organisation is listed without a homepage yet,
 * the same as today's page.
 * `[group, [[name, homepage], ...]]`
 */
export const REFERENCE_POOL: Array<{
  group: string;
  items: Array<[string, string | null]>;
}> = [
  {
    group: "Off-highway & genel",
    items: [
      ["iVT Off-Highway / iVT International", "https://www.ivtinternational.com/"],
      ["KHL Group", "https://www.khl.com/"],
      ["Diesel Progress / Diesel & Gas Turbine", "https://www.dieselprogress.com/"],
      ["SAE Truck & Off-Highway Engineering", "https://www.sae.org/"],
    ],
  },
  {
    group: "Bileşen & güç aktarma",
    items: [
      ["Hydraulics & Pneumatics", "https://www.hydraulicspneumatics.com/"],
      ["Power Transmission Engineering", "https://www.powertransmission.com/"],
      ["Gear Technology", "https://www.geartechnology.com/"],
      ["NFPA", "https://www.nfpa.com/"],
    ],
  },
  {
    group: "Madencilik",
    items: [
      ["Engineering & Mining Journal (E&MJ)", "https://www.e-mj.com/"],
      ["International Mining", "https://im-mining.com/"],
      ["Mining Magazine", "https://www.miningmagazine.com/"],
      ["Global Mining Review", "https://www.globalminingreview.com/"],
      ["ICMM", "https://www.icmm.com/"],
    ],
  },
  {
    group: "Liman & malzeme elleçleme",
    items: [
      ["Port Technology International", "https://www.porttechnology.org/"],
      ["Port Strategy", "https://www.portstrategy.com/"],
      ["HANSA", "https://www.hansa-online.de/"],
      ["International Cranes & Specialized Transport", "https://www.khl.com/"],
      ["FEM", "https://www.fem-eur.org/"],
      ["IAPH", "https://www.iaphworldports.org/"],
    ],
  },
  {
    group: "Tarım",
    items: [
      ["Farm Equipment", "https://www.farm-equipment.com/"],
      ["profi / Landtechnik / agrartechnik", "https://www.profi.com/"],
      ["Farmers Weekly", "https://www.fwi.co.uk/"],
      ["CEMA", "https://www.cema-agri.org/"],
      ["TARMAKBİR", "https://www.tarmakbir.org/"],
    ],
  },
  {
    group: "Türkiye kurumları",
    items: [
      ["MAİB", "https://www.maib.org.tr/"],
      ["MAKFED", "https://www.makfed.org.tr/"],
      ["İMDER", "https://www.imder.org.tr/"],
      ["İSDER", "https://www.isder.org.tr/"],
      ["AKDER", "https://www.akder.org.tr/"],
      ["MAPEG", "https://www.mapeg.gov.tr/"],
      ["TMMOB meslek odaları", "https://www.tmmob.org.tr/"],
    ],
  },
];

/** Stable, ASCII-only key used for de-duplication. */
export function seedKey(name: string): string {
  return name
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
