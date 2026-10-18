import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { autoEligible, autoPublishedToday, selectDraft, toPublished } from './publish-news.mjs';

const CANDIDATES = process.env.REVIEW_CANDIDATES_FILE || new URL('../agent/drafts/news-candidates.json', import.meta.url);
const PUBLISHED = process.env.REVIEW_PUBLISHED_FILE || new URL('../src/data/published-news.json', import.meta.url);
const SOURCES = process.env.REVIEW_SOURCES_FILE || new URL('../agent/sources.json', import.meta.url);
const TMP = process.env.REVIEW_TMP_DIR ? pathToFileURL(path.resolve(process.env.REVIEW_TMP_DIR) + path.sep) : new URL('../.tmp/', import.meta.url);

const candidates = JSON.parse(await fs.readFile(CANDIDATES,'utf8'));
const published = JSON.parse(await fs.readFile(PUBLISHED,'utf8'));
const sources = JSON.parse(await fs.readFile(SOURCES,'utf8'));
const excluded = (process.env.REVIEW_EXCLUDED_IDS || '').split(',').filter(Boolean);
const now = new Date(process.env.REVIEW_NOW || Date.now());
// Keep the best eligible story available for the next weekday automatic slot.
// Once today's automatic story is live, remaining drafts may enter the PR queue.
const reserved = autoPublishedToday(published, now) ? null
  : selectDraft(candidates, published, sources, excluded, item => autoEligible(item, now));
const selected = selectDraft(candidates, published, sources, [...excluded, ...(reserved ? [reserved.id] : [])]);

await fs.mkdir(TMP,{recursive:true});

if (!selected) {
  await fs.writeFile(new URL('review-count.txt',TMP),'0');
  console.log(JSON.stringify({selected:0}));
  process.exit(0);
}

const e = selected.editorial;
const branch = 'editorial-auto-' + selected.id;
const item = toPublished(selected);
const body = [
  'Bu PR Makine Nabzı editoryal ajanı tarafından otomatik hazırlanmıştır.',
  '',
  '## Onay',
  '- **Merge** → haber otomatik olarak siteye aktarılır.',
  '- **Close** → haber reddedilir ve sıradaki haber hazırlanır.',
  '- PR yorumu → revizyon isteği.',
  '',
  '## Haber',
  '**' + item.title + '**',
  '',
  'Sektör: ' + item.sector,
  ...(item.subsector ? ['Alt sektör: ' + item.subsector] : []),
  'Yayın türü: ' + (item.format === 'gorus-analiz' ? 'Görüş / Analiz' : 'Haber'),
  'Teknoloji: ' + (item.technologies.join(', ') || '-'),
  'Kaynak: ' + item.source_name,
  'Kaynak tarihi: ' + item.source_published_at.slice(0,10),
  'Aday ID: ' + item.id,
  '',
  'Kaynak: ' + item.source_url,
  '',
  '## Yayın öncesi kontrol',
  '- [ ] Kaynak sayfası açıldı; model, teknik sayı, tarih ve iddialar doğrulandı.',
  '- [ ] Türkçe özet özgün ve kaynakla uyumlu; teknik yorum olgulardan ayrılıyor.',
  '- [ ] Başlık, bağlantı, sektör ve görsel kullanım hakkı kontrol edildi.',
  '',
  '## Kaynağın sınırları ve belirsizlikler',
  ...(Array.isArray(e.uncertainty_notes) && e.uncertainty_notes.length
    ? e.uncertainty_notes.map(note => '- ' + note)
    : ['- Taslakta ayrıca belirtilen belirsizlik yok; kaynak yine de elle kontrol edilmelidir.']),
  '',
  '## Not',
  item.hero_image ? 'Kapak görseli tanımlı.' : 'Kapak görseli henüz atanmadı; görsel telif kontrolü ayrı tutulur.'
].join('\n');

await fs.writeFile(new URL('review-count.txt',TMP),'1');
await fs.writeFile(new URL('review-branch.txt',TMP),branch);
await fs.writeFile(new URL('review-id.txt',TMP),selected.id);
await fs.writeFile(new URL('review-news.json',TMP),JSON.stringify(item,null,2)+'\n');
await fs.writeFile(new URL('review-pr-title.txt',TMP),'Yayın Onayı: ' + item.title);
await fs.writeFile(new URL('review-pr-body.md',TMP),body+'\n');

console.log(JSON.stringify({selected:1,id:selected.id,title:item.title,branch,slug:item.slug},null,2));
