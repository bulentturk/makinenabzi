import type { APIRoute } from 'astro';
import news from '../data/published-news.json';

const entities: Record<string,string> = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'};
const escapeXml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://makinenabzi.com/');
  const items = [...news]
    .sort((a,b) => Date.parse(b.site_published_at) - Date.parse(a.site_published_at))
    .map(item => {
      const url = new URL(`/haberler/${item.slug}/`,origin).href;
      const date = new Date(item.site_published_at || item.source_published_at).toUTCString();
      return `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="false">${escapeXml(item.id)}</guid>
    <pubDate>${escapeXml(date)}</pubDate>
    <description>${escapeXml(`${item.dek} Kaynak: ${item.source_name} — ${item.source_url}`)}</description>
  </item>`;
    }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Makine Nabzı — Haberler</title>
  <link>${escapeXml(new URL('/haberler/',origin).href)}</link>
  <description>Mobil makine teknolojilerinde editoryal onaydan geçmiş haberler.</description>
  <language>tr-TR</language>
${items}
</channel></rss>`;
  return new Response(xml,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
};
