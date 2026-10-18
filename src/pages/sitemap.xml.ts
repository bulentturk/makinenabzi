import type { APIRoute } from 'astro';
import news from '../data/published-news.json';
import { guides } from '../data/technical-guides';
import { formatPieces } from '../data/formats';
import listings from '../data/listings.json';

type NewsItem = { slug: string; site_published_at?: string; site_updated_at?: string };
const items = news as NewsItem[];

const staticPages = ['/', '/haberler/', '/ilanlar/', '/ilan-ver/', '/teknik-blog/', '/formatlar/', '/fuar-takvimi/', '/kaynaklar/', '/hakkimizda/', '/gizlilik/', '/iletisim/'];
type ListingEntry = { slug: string; sectorSlug: string; updatedAt: string };
const listingItems = (listings.listings ?? []) as ListingEntry[];
const listingSectors = [...new Set(listingItems.map((item) => item.sectorSlug))];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://makinenabzi.com/');
  const staticUrls = staticPages.map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`);
  const newsUrls = items.map((item) => {
    const loc = new URL(`/haberler/${item.slug}/`, origin).href;
    const lastmod = item.site_updated_at || item.site_published_at;
    return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`;
  });
  const guideUrls = guides.map((guide) => {
    const loc = new URL(`/teknik-blog/${guide.slug}/`, origin).href;
    return `  <url><loc>${loc}</loc><lastmod>${guide.updated.slice(0, 10)}</lastmod></url>`;
  });
  const formatUrls = formatPieces.map((piece) => {
    const loc = new URL(`/formatlar/${piece.slug}/`, origin).href;
    return `  <url><loc>${loc}</loc><lastmod>${piece.updated.slice(0, 10)}</lastmod></url>`;
  });
  const sectorUrls = listingSectors.map((sector) =>
    `  <url><loc>${new URL(`/ilanlar/${sector}/`, origin).href}</loc></url>`,
  );
  const listingUrls = listingItems.map((item) =>
    `  <url><loc>${new URL(`/ilanlar/${item.sectorSlug}/${item.slug}/`, origin).href}</loc><lastmod>${item.updatedAt.slice(0, 10)}</lastmod></url>`,
  );
  const urls = [...staticUrls, ...newsUrls, ...guideUrls, ...formatUrls, ...sectorUrls, ...listingUrls].join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
