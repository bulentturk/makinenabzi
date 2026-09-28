import type { APIRoute } from "astro";
import news from "../data/published-news.json";

// Astro statik derlemede bu endpoint build sırasında dist/feed.json olarak
// yazılır; yani bir API sunucusu gerekmez.
export const prerender = true;

export const GET: APIRoute = () => {
  const items = [...news].sort(
    (a, b) =>
      Date.parse(b.site_published_at || b.source_published_at) -
      Date.parse(a.site_published_at || a.source_published_at),
  );

  return new Response(
    JSON.stringify({
      version: 1,
      generated_at: new Date().toISOString(),
      site: "https://makinenabzi.com",
      count: items.length,
      items,
    }),
    { headers: { "content-type": "application/json; charset=utf-8" } },
  );
};
