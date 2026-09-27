import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { hasMobileContext } from './news-context.mjs';

const CANDIDATES = process.env.REVIEW_CANDIDATES_FILE || new URL('../agent/drafts/news-candidates.json', import.meta.url);
const PUBLISHED = process.env.REVIEW_PUBLISHED_FILE || new URL('../src/data/published-news.json', import.meta.url);
const SOURCES = process.env.REVIEW_SOURCES_FILE || new URL('../agent/sources.json', import.meta.url);
const TMP = process.env.REVIEW_TMP_DIR ? pathToFileURL(path.resolve(process.env.REVIEW_TMP_DIR) + path.sep) : new URL('../.tmp/', import.meta.url);

function slugify(input='') {
  const map = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
  return input.split('').map(ch => map[ch] ?? ch).join('')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90);
}

const candidates = JSON.parse(await fs.readFile(CANDIDATES,'utf8'));
const published = JSON.parse(await fs.readFile(PUBLISHED,'utf8'));
const sources = JSON.parse(await fs.readFile(SOURCES,'utf8'));
const sourceByName = new Map(sources.map(source => [source.name,source]));
const publishedIds = new Set(published.map(x => x.id));

const selected = candidates
  .filter(x => x.status === 'drafted' && x.editorial?.title_tr && !publishedIds.has(x.id))
  .filter(x => {
    const source = sourceByName.get(x.source_name);
    return !source?.require_mobile_context || hasMobileContext(`${x.title_original} ${x.summary_source}`);
  })
  .sort((a,b) => (b.editorial_fit_score - a.editorial_fit_score) || (b.relevance_score - a.relevance_score))[0];

await fs.mkdir(TMP,{recursive:true});

if (!selected) {
  await fs.writeFile(new URL('review-count.txt',TMP),'0');
  console.log(JSON.stringify({selected:0}));
  process.exit(0);
}

const e = selected.editorial;
const slug = slugify(e.title_tr);
const branch = 'editorial-auto-' + selected.id;
const item = {
  id: selected.id,
  slug,
  title: e.title_tr,
  dek: e.dek_tr || '',
  summary: e.summary_tr || '',
  why_it_matters: e.why_it_matters_tr || '',
  key_facts: Array.isArray(e.key_facts) ? e.key_facts : [],
  sector: e.suggested_sector || selected.sector,
  technologies: Array.isArray(e.suggested_technologies) && e.suggested_technologies.length ? e.suggested_technologies : selected.technologies,
  tags: Array.isArray(e.suggested_tags) ? e.suggested_tags : [],
  source_name: selected.source_name,
  source_url: selected.source_url,
  source_published_at: selected.published_at,
  site_published_at: new Date().toISOString(),
  hero_image: e.hero_image || ''
};

const next = [item, ...published];
const body = [
  'Bu PR Makine Nabzı editoryal ajanı tarafından otomatik hazırlanmıştır.',
  '',
  '## Onay',
  '- **Merge** → haber yayınlanır.',
  '- **Close** → haber reddedilir ve sıradaki haber hazırlanır.',
  '- PR yorumu → revizyon isteği.',
  '',
  '## Haber',
  '**' + item.title + '**',
  '',
  'Sektör: ' + item.sector,
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
await fs.writeFile(new URL('review-news.json',TMP),JSON.stringify(next,null,2)+'\n');
await fs.writeFile(new URL('review-pr-title.txt',TMP),'Yayın Onayı: ' + item.title);
await fs.writeFile(new URL('review-pr-body.md',TMP),body+'\n');

console.log(JSON.stringify({selected:1,id:selected.id,title:item.title,branch,slug},null,2));
