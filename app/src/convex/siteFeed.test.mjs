import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parsePublishedFeed } from "./siteFeed.ts";
import { editorialPatch } from "./siteSyncLogic.ts";

test("published newsroom feed maps real articles and rejects incomplete lists", () => {
  const published = JSON.parse(
    readFileSync(new URL("../../../src/data/published-news.json", import.meta.url)),
  );
  const result = parsePublishedFeed(
    JSON.stringify({ items: published }),
    "https://makinenabzi.com",
  );

  assert.equal(result?.length, published.length);
  assert.ok(result?.every((article) => article.slug && article.title));
  assert.equal(
    parsePublishedFeed(
      JSON.stringify({ items: [...published, { slug: "incomplete" }] }),
      "https://makinenabzi.com",
    ),
    null,
  );
  assert.equal(
    parsePublishedFeed(
      JSON.stringify({ items: [...published, published[0]] }),
      "https://makinenabzi.com",
    ),
    null,
  );
});

test("approved shorter corrections replace old fields without changing breaking", () => {
  const original = {
    slug: "ornek", url: "https://makinenabzi.com/haberler/ornek/",
    title: "Eski başlık", summary: "Eski özet", body: "Uzun eski metin",
    facts: ["Eski bilgi"], analysis: "Eski analiz", category: "Liman",
    source: "Kaynak", sourceUrl: "https://example.com", readingMinutes: 2,
    publishedAt: 100, breaking: true, tags: ["eski"], isPublished: false,
  };
  const incoming = {
    ...original, title: "Düzeltilmiş başlık", body: "Kısa metin",
    facts: [], analysis: undefined, sourceUrl: undefined, breaking: false,
  };
  const patch = editorialPatch(original, incoming);
  assert.equal(patch?.title, "Düzeltilmiş başlık");
  assert.equal(patch?.body, "Kısa metin");
  assert.deepEqual(patch?.facts, []);
  assert.equal(patch?.analysis, undefined);
  assert.equal(patch?.isPublished, true);
  assert.equal("breaking" in patch, false);
  assert.equal(editorialPatch({ ...original, ...patch }, incoming), null);
});
