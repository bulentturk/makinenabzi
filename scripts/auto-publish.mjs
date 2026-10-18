import fs from 'node:fs/promises';
import { istanbulDay, selectDraft, toPublished } from './publish-news.mjs';

const candidatesFile = process.env.AUTO_CANDIDATES_FILE || new URL('../agent/drafts/news-candidates.json', import.meta.url);
const publishedFile = process.env.AUTO_PUBLISHED_FILE || new URL('../src/data/published-news.json', import.meta.url);
const sourcesFile = process.env.AUTO_SOURCES_FILE || new URL('../agent/sources.json', import.meta.url);
const now = new Date(process.env.AUTO_NOW || Date.now());
const { day, weekday } = istanbulDay(now);

if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) {
  console.log(`No automatic publication outside weekdays in Türkiye: ${day}`);
  process.exit(0);
}

const [candidates, published, sources] = await Promise.all([candidatesFile, publishedFile, sourcesFile]
  .map(async file => JSON.parse(await fs.readFile(file, 'utf8'))));

if (published.some(item => item.publish_mode === 'automatic' && istanbulDay(new Date(item.site_published_at)).day === day)) {
  console.log(`Already published one automatic article on ${day}`);
  process.exit(0);
}

const excluded = (process.env.AUTO_EXCLUDED_IDS || '').split(',').filter(Boolean);
const eligible = item => {
  const e = item.editorial;
  const inaccessible = (e.uncertainty_notes || []).some(note =>
    /(?:403|404|erişilemedi|alınamadı|açılamadı|ulaşılamadı|unavailable|inaccessible)/i.test(note));
  const fresh = Number.isFinite(Date.parse(item.published_at)) && now - new Date(item.published_at) <= 30 * 86400000;
  return /^https:\/\//.test(item.source_url || '') && fresh && !inaccessible
    && (e.summary_tr || '').length >= 250 && Array.isArray(e.key_facts) && e.key_facts.length >= 2;
};
const selected = selectDraft(candidates, published, sources, excluded, eligible);
if (!selected) {
  console.log('No eligible, source-backed draft available for automatic publication.');
  process.exit(0);
}

const item = { ...toPublished(selected, now.toISOString()), publish_mode: 'automatic' };
selected.status = 'published';
selected.editorial = { ...selected.editorial, reviewed: false, review_result: 'auto_published', reviewed_at: now.toISOString() };
await Promise.all([
  fs.writeFile(candidatesFile, JSON.stringify(candidates, null, 2) + '\n'),
  fs.writeFile(publishedFile, JSON.stringify([item, ...published], null, 2) + '\n')
]);
console.log(JSON.stringify({ published: item.id, day, title: item.title }));
