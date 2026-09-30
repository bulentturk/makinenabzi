/**
 * Maps the newsroom's structured content layer into the app's article shape.
 *
 * The Astro repo keeps approved stories in `src/data/published-news.json`; the
 * same data is exposed as `feed.json` on the site. Reading it means the app gets
 * the editorially approved fields — dek, "Öne çıkan bilgiler", "Makine Nabzı
 * yorumu" and the credited source — in a single request, with no HTML parsing to
 * break when a template changes.
 *
 * A malformed entry invalidates the structured feed. The sync must not treat
 * an incomplete list as an editorial withdrawal of the missing story.
 */

export interface SiteArticle {
  slug: string;
  url: string;
  title: string;
  summary: string;
  body: string;
  facts: string[];
  analysis?: string;
  category: string;
  source: string;
  sourceUrl?: string;
  readingMinutes: number;
  publishedAt: number;
  breaking: boolean;
  tags: string[];
}

/** Sector slugs used by the newsroom, mapped to their display labels. */
const SECTOR_LABELS: Record<string, string> = {
  "is-makinalari": "İş Makinaları",
  madencilik: "Madencilik",
  liman: "Liman & Elleçleme",
  tarim: "Tarım Makinaları",
  "arac-ustu-ekipman": "Araç Üstü Ekipman",
  "havaalani-gse": "Havalimanı & GSE",
  "marine-yatcilik": "Marine & Yatçılık",
  elektrifikasyon: "Elektrifikasyon",
};

/** Technology slugs used by the newsroom, mapped to their display labels. */
const TECHNOLOGY_LABELS: Record<string, string> = {
  elektrifikasyon: "Elektrifikasyon",
  hidrolik: "Hidrolik",
  "yuruyus-guc-aktarma": "Yürüyüş & Güç Aktarma",
  "elektronik-telematik": "Elektronik & Telematik",
  "otonomi-ai": "Otonomi & AI",
  "emisyon-stage-v": "Emisyon & Stage V",
  "fonksiyonel-guvenlik": "Fonksiyonel Güvenlik",
  "termal-yonetim": "Termal Yönetim",
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asText(entry))
    .filter((entry) => entry.length > 0);
}

function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Accepts either a bare published-news array (as `src/data/published-news.json`
 * is stored) or the versioned `{ items: [...] }` envelope the site endpoint
 * serves, so either shape can be dropped in while the endpoint is rolled out.
 * Returns `null` when the payload carries no story list at all, which is the
 * signal to fall back to the RSS path.
 */
export function parsePublishedFeed(
  raw: string,
  site: string,
): SiteArticle[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  let entries: unknown = parsed;
  if (!Array.isArray(entries) && entries && typeof entries === "object") {
    entries = (entries as Record<string, unknown>).items;
  }
  if (!Array.isArray(entries)) return null;

  const articles: SiteArticle[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;

    const slug = asText(item.slug);
    const title = asText(item.title);
    if (!slug || !title || seen.has(slug)) return null;
    seen.add(slug);

    const dek = asText(item.dek);
    // In the newsroom schema `summary` holds the body paragraphs and `dek` is
    // the standfirst, which is the opposite of this app's naming.
    const body = asText(item.summary) || dek;
    const facts = asList(item.key_facts);
    const analysis = asText(item.why_it_matters);
    const sector = asText(item.sector);
    const technologies = asList(item.technologies).map(
      (slugValue) => TECHNOLOGY_LABELS[slugValue] ?? slugValue,
    );

    const parsedDate = Date.parse(
      asText(item.site_published_at) || asText(item.source_published_at),
    );
    if (Number.isNaN(parsedDate)) return null;

    articles.push({
      slug,
      url: `${site}/haberler/${slug}/`,
      title,
      summary: dek,
      body,
      facts,
      analysis: analysis || undefined,
      category: SECTOR_LABELS[sector] || sector || "Haberler",
      source: asText(item.source_name) || "Makine Nabzı",
      sourceUrl: asText(item.source_url) || undefined,
      readingMinutes: readingMinutes(
        [body, facts.join(" "), analysis].join(" "),
      ),
      publishedAt: parsedDate,
      // "Son dakika" stays an editorial decision; only `pushStory` sets it.
      breaking: false,
      tags: [...new Set([...technologies, ...asList(item.tags)])],
    });
  }

  return articles;
}
