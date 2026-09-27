import type { APIRoute } from 'astro';
import news from '../data/published-news.json';

const pages = [
  '/',
  '/haberler/',
  '/teknik-blog/',
  '/fuar-takvimi/',
  '/kaynaklar/',
  '/hakkimizda/',
  ...news.map((item) => `/haberler/${item.slug}/`),
];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://makinenabzi.com/');
  const urls = pages.map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
