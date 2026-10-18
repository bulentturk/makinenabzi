#!/usr/bin/env node
/**
 * Onaylanmış ilanları Convex'ten çekip `src/data/listings.json` dosyasına yazar.
 *
 * Site statik üretildiği için (GitHub Pages) ilanlar derleme anında gömülür.
 * Böylece hem SEO korunur hem de GitHub Pages'te sunucu kodu gerekmez.
 *
 * Kullanım:
 *   node scripts/sync-listings.mjs            # hata olursa mevcut dosyayı korur
 *   node scripts/sync-listings.mjs --strict   # hata olursa süreci durdurur
 *
 * Convex adresi `VITE_CONVEX_URL` ortam değişkeninden ya da `app/.env.local`
 * dosyasından okunur.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outFile = join(root, 'src', 'data', 'listings.json');
const sectorsFile = join(root, 'src', 'data', 'listing-sectors.json');
const strict = process.argv.includes('--strict');

const sectors = JSON.parse(readFileSync(sectorsFile, 'utf8'));
const sectorByLabel = new Map(sectors.map((s) => [s.label, s.slug]));
const sectorBySlug = new Map(sectors.map((s) => [s.slug, s.label]));

function resolveConvexUrl() {
  if (process.env.VITE_CONVEX_URL) return process.env.VITE_CONVEX_URL;
  const envFile = join(root, 'app', '.env.local');
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, 'utf8').match(/^VITE_CONVEX_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return null;
}

const CATEGORY_LABELS = {
  satilik: 'Satılık',
  kiralik: 'Kiralık',
  'yedek-parca': 'Yedek Parça',
  hizmet: 'Hizmet',
};

const CONDITION_LABELS = {
  sifir: 'Sıfır',
  'ikinci-el': 'İkinci el',
  yenilenmis: 'Yenilenmiş',
};

function toView(item) {
  const sectorSlug = sectorByLabel.get(item.sector) ?? 'diger';
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    sector: item.sector,
    sectorSlug,
    category: item.category,
    categoryLabel: CATEGORY_LABELS[item.category] ?? item.category,
    brand: item.brand ?? null,
    model: item.model ?? null,
    year: item.year ?? null,
    hours: item.hours ?? null,
    condition: item.condition ?? null,
    conditionLabel: item.condition ? CONDITION_LABELS[item.condition] : null,
    city: item.city ?? null,
    price: item.priceHidden ? null : (item.price ?? null),
    currency: item.currency ?? 'TRY',
    priceHidden: Boolean(item.priceHidden),
    cover: item.cover ?? null,
    images: (item.gallery ?? []).map((image) => image.url).filter(Boolean),
    contactName: item.contactName,
    // Tam numara HTML'e gömülmez; sayfada "Göster" ile açılır.
    contactPhone: item.contactPhone,
    views: item.views ?? 0,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  };
}

async function queryConvex(url, path, args = {}) {
  const res = await fetch(`${url}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(`${path}: ${json.errorMessage ?? 'bilinmeyen hata'}`);
  }
  return json.value;
}

async function main() {
  const url = resolveConvexUrl();
  if (!url) {
    console.warn('[listings] Convex adresi bulunamadı (VITE_CONVEX_URL). Mevcut dosya korunuyor.');
    if (strict) process.exit(1);
    return;
  }

  try {
    const [rows, stats] = await Promise.all([
      queryConvex(url, 'listings:listApproved', { limit: 100 }),
      queryConvex(url, 'listings:sectorStats'),
    ]);

    const listings = rows.map(toView);
    const payload = {
      generatedAt: new Date().toISOString(),
      total: stats.total,
      sectors: sectors.map((sector) => ({
        ...sector,
        count: stats.sectors.find((row) => row.label === sector.label)?.count ?? 0,
      })),
      listings,
    };

    writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`[listings] ${listings.length} ilan yazıldı -> src/data/listings.json`);
  } catch (error) {
    console.warn(`[listings] Senkron başarısız: ${error.message}`);
    if (existsSync(outFile)) {
      console.warn('[listings] Önceki liste korunuyor.');
    }
    if (strict) process.exit(1);
  }
}

await main();
