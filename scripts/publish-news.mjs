import { hasMobileContext, hasSectorEquipmentContext } from './news-context.mjs';

export function istanbulDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { day: `${value.year}-${value.month}-${value.day}`, weekday: value.weekday };
}

export function selectDraft(candidates, published, sources, excludedIds = [], eligible = () => true) {
  const sourceByName = new Map(sources.map(source => [source.name, source]));
  const used = new Set([...published.map(item => item.id), ...excludedIds]);
  return candidates
    .filter(item => item.status === 'drafted' && item.editorial?.title_tr && !used.has(item.id) && eligible(item))
    .filter(item => {
      const source = sourceByName.get(item.source_name);
      const text = `${item.title_original} ${item.summary_source}`;
      return (!source?.require_mobile_context || hasMobileContext(text))
        && (!source?.require_equipment_context || hasSectorEquipmentContext(text, source.require_equipment_context));
    })
    .sort((a, b) => (b.editorial_fit_score - a.editorial_fit_score) || (b.relevance_score - a.relevance_score))[0];
}

function slugify(input = '') {
  const map = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u' };
  return input.split('').map(ch => map[ch] ?? ch).join('').toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export function toPublished(item, at = new Date().toISOString()) {
  const e = item.editorial;
  return {
    id: item.id,
    slug: slugify(e.title_tr),
    title: e.title_tr,
    dek: e.dek_tr || '',
    summary: e.summary_tr || '',
    why_it_matters: e.why_it_matters_tr || '',
    key_facts: Array.isArray(e.key_facts) ? e.key_facts : [],
    format: e.editorial_format === 'gorus-analiz' ? 'gorus-analiz' : 'haber',
    sector: e.suggested_sector || item.sector,
    subsector: item.subsector || null,
    technologies: Array.isArray(e.suggested_technologies) && e.suggested_technologies.length ? e.suggested_technologies : item.technologies,
    tags: Array.isArray(e.suggested_tags) ? e.suggested_tags : [],
    source_name: item.source_name,
    source_url: item.source_url,
    source_published_at: item.published_at,
    site_published_at: at,
    hero_image: e.hero_image || ''
  };
}
