import fs from 'node:fs/promises';

const responsePath = process.argv[2];
if (!responsePath) throw new Error('Usage: node scripts/apply-editorial-response.mjs <response-file>');

const CANDIDATES = new URL('../agent/drafts/news-candidates.json', import.meta.url);
const SELECTED = new URL('../.tmp/editorial-selected.json', import.meta.url);

const raw = (await fs.readFile(responsePath,'utf8')).trim();
const selectedIds = new Set(JSON.parse(await fs.readFile(SELECTED,'utf8')));

function parseJson(text) {
  const cleaned = text.replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start,end+1));
  throw new Error('AI response did not contain valid JSON');
}

const result = parseJson(raw);
if (!Array.isArray(result.drafts)) throw new Error('AI response missing drafts array');

const allowedSectors = new Set(['is-makinalari','madencilik','liman','tarim','arac-ustu-ekipman','elektrifikasyon']);
const allowedTech = new Set(['elektrifikasyon','hidrolik','yuruyus-guc-aktarma','elektronik-telematik','otonomi-ai','emisyon-stage-v','fonksiyonel-guvenlik','termal-yonetim']);

const byId = new Map();
for (const draft of result.drafts) {
  if (!selectedIds.has(draft.id)) continue;
  if (!draft.title_tr || !draft.summary_tr) continue;
  byId.set(draft.id,draft);
}

if (!byId.size) throw new Error('No valid drafts matched selected candidate IDs');

const candidates = JSON.parse(await fs.readFile(CANDIDATES,'utf8'));
const now = new Date().toISOString();

for (const item of candidates) {
  const draft = byId.get(item.id);
  if (!draft) continue;

  item.status = 'drafted';
  item.editorial = {
    ...item.editorial,
    title_tr: String(draft.title_tr || '').trim(),
    dek_tr: String(draft.dek_tr || '').trim(),
    summary_tr: String(draft.summary_tr || '').trim(),
    why_it_matters_tr: String(draft.why_it_matters_tr || '').trim(),
    key_facts: Array.isArray(draft.key_facts) ? draft.key_facts.slice(0,10) : [],
    seo_title: String(draft.seo_title || '').trim(),
    meta_description: String(draft.meta_description || '').trim(),
    suggested_tags: Array.isArray(draft.suggested_tags) ? draft.suggested_tags.slice(0,12) : [],
    suggested_sector: allowedSectors.has(draft.suggested_sector) ? draft.suggested_sector : item.sector,
    suggested_technologies: Array.isArray(draft.suggested_technologies)
      ? draft.suggested_technologies.filter(x => allowedTech.has(x)).slice(0,8)
      : item.technologies,
    source_facts_used: Array.isArray(draft.source_facts_used) ? draft.source_facts_used.slice(0,12) : [],
    uncertainty_notes: Array.isArray(draft.uncertainty_notes) ? draft.uncertainty_notes.slice(0,8) : [],
    generated_at: now,
    generated_by: 'github-models',
    reviewed: false
  };
}

await fs.writeFile(CANDIDATES,JSON.stringify(candidates,null,2)+'\n');
console.log(JSON.stringify({drafts_applied:byId.size,ids:[...byId.keys()]},null,2));
