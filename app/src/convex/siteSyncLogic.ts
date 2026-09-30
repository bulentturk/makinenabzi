import type { SiteArticle } from "./siteFeed";

/** Keep editorial corrections authoritative without overwriting the push flag. */
export function editorialPatch(
  existing: SiteArticle & { isPublished?: boolean },
  incoming: SiteArticle,
) {
  const { slug: _slug, breaking: _breaking, ...fields } = incoming;
  const patch = { ...fields, isPublished: true };
  if (
    Object.entries(patch).every(([key, value]) =>
      JSON.stringify(value) === JSON.stringify(existing[key as keyof typeof existing]),
    )
  ) return null;
  return patch;
}
