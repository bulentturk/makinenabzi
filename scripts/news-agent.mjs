import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 12000 });
const sources = JSON.parse(await fs.readFile(new URL('../agent/sources.json', import.meta.url), 'utf8'));

const OUT = new URL('../agent/drafts/news-candidates.json', import.meta.url);
const HEALTH = new URL('../agent/drafts/source-health.json', import.meta.url);
const DAYS = Number(process.env.NEWS_LOOKBACK_DAYS || 4);
const MAX_PER_SOURCE = Number(process.env.NEWS_MAX_PER_SOURCE || 15);
const cutoff = Date.now() - DAYS * 86400000;

const rules = [
  ['elektrifikasyon', ['electric','battery','bms','charging','charger','inverter','electrification','hybrid','fuel cell','zero emission']],
  ['otonomi-ai', ['autonomous','automation','ai ','artificial intelligence','machine vision','lidar','radar','driverless','remote operation']],
  ['elektronik-telematik', ['telematics','telemetry','connected','can bus','j1939','software','digital','remote monitoring','fleet management']],
  ['yuruyus-guc-aktarma', ['transmission','drivetrain','powertrain','powershift','hydrostatic','axle','differential','final drive','torque converter','gearbox']],
  ['hidrolik', ['hydraulic','pump','valve','fluid power','hydrostatic']],
  ['emisyon-stage-v', ['stage v','tier 4','dpf','scr','adblue','diesel exhaust','aftertreatment']],
  ['fonksiyonel-guvenlik', ['safety','functional safety','iso 13849','collision avoidance']],
  ['termal-yonetim', ['thermal','cooling','heat management','radiator']]
];

const sectorRules = [
  ['madencilik', ['mining','mine','open pit','quarry','lhd','haul truck','drill rig']],
  ['liman', ['port','terminal','container','reach stacker','straddle carrier','harbour crane']],
  ['tarim', ['agriculture','agricultural','tractor','harvester','farm ','combine']],
  ['arac-ustu-ekipman', ['truck-mounted','aerial platform','concrete pump','mixer truck','refuse truck','municipal']],
  ['is-makinalari', ['excavator','loader','dozer','grader','construction equipment','compact equipment','road machinery']]
];

function normalized(s='') {
  return s.toLowerCase().replace(/\s+/g,' ').trim();
}
function hasTerm(text, term) {
  const escaped = term.trim().replace(/[.*+?^$()|[\]\\{}]/g, '\\function normalized(s='') {
  return s.toLowerCase().replace(/\s+/g,' ').trim();
}
function tagsFrom(text) {
  const t = normalized(text);
  return rules.filter(([,words]) => words.some(w => t.includes(w))).map(([tag]) => tag);
}
function sectorFrom(text, fallback) {
  const t = normalized(text);
  for (const [sector, words] of sectorRules) if (words.some(w => t.includes(w))) return sector;
  return fallback;
}').replace(/\s+/g, '\\s+');
  return new RegExp('(^|[^a-z0-9])' + escaped + '([^a-z0-9]|$)', 'i').test(text);
}
function tagsFrom(text) {
  const t = normalized(text);
  return rules.filter(([,words]) => words.some(w => hasTerm(t, w))).map(([tag]) => tag);
}
function sectorFrom(text, fallback) {
  const t = normalized(text);
  for (const [sector, words] of sectorRules) if (words.some(w => hasTerm(t, w))) return sector;
  return fallback;
}
const machineryTerms = [
  'excavator','loader','wheel loader','dozer','grader','skid steer','compact track loader',
  'crane','reach stacker','straddle carrier','terminal tractor','forklift','telehandler',
  'haul truck','dump truck','mining truck','lhd','drill rig','crusher','conveyor','tbm',
  'mixer','concrete pump','aerial platform','tractor','harvester','undercarriage',
  'transmission','powertrain','drivetrain','hydrostatic','final drive','axle','differential',
  'hydraulic','inverter','electric motor','bms','telematics','telemetry','fleet management',
  'autonomous haulage','autonomous transport','remote operation','collision avoidance',
  'machine vision','camera system','charging system','battery electric'
];
const weakBusinessTerms = [
  'apprentice','graduate','reconciliation action plan','merger','acquisition','supply resilience',
  'funding boost','career opportunities','copper market','commodity','water treatment'
];
function editorialFit(item, source) {
  const text = normalized(item.title + ' ' + (item.contentSnippet || ''));
  const title = normalized(item.title || '');
  const tags = tagsFrom(text);
  let fit = 0;
  if (machineryTerms.some(w => hasTerm(text, w))) fit += 55;
  fit += tags.length * 12;
  if (['launch','introduces','introduce','new','fleet','system','platform','retrofit','upgrade'].some(w => hasTerm(title, w))) fit += 10;
  if (weakBusinessTerms.some(w => hasTerm(text, w))) fit -= 30;
  if (source.sector === 'liman' && ['equipment','terminal operations','crane','reach stacker'].some(w => hasTerm(text,w))) fit += 10;
  if (source.sector === 'madencilik' && ['autonomous','battery electric','haul truck','lhd','drill rig','equipment'].some(w => hasTerm(text,w))) fit += 10;
  return fit;
}
function score(item, source) {
  const text = normalized(item.title + ' ' + (item.contentSnippet || ''));
  let s = source.priority || 50;
  s += tagsFrom(text).length * 8;
  s += Math.max(0, Math.min(40, editorialFit(item, source)));
  if (/(launch|introduc|new |electric|autonom|battery|technology|system|platform|retrofit)/.test(text)) s += 10;
  return s;
}
function idFor(url,title) {
  return crypto.createHash('sha1').update(url || title).digest('hex').slice(0,16);
}

let previous = [];
try { previous = JSON.parse(await fs.readFile(OUT,'utf8')); } catch {}
const seen = new Set(previous.map(x => x.id));

async function collectSource(source) {
  const started = Date.now();
  try {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'user-agent': 'MakineNabziNewsAgent/1.0 (+https://makinenabzi.com)' }
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const xml = await response.text();
    const feed = await parser.parseString(xml);
    const items = [];
    for (const item of (feed.items || []).slice(0, MAX_PER_SOURCE)) {
      const date = Date.parse(item.isoDate || item.pubDate || '') || Date.now();
      if (date < cutoff) continue;
      const id = idFor(item.link || item.guid || '', item.title || '');
      if (seen.has(id)) continue;

      const text = [item.title, item.contentSnippet, item.content].filter(Boolean).join(' ');
      const fit = editorialFit(item, source);
      if (fit < 30) continue;
      items.push({
        id,
        status: 'candidate',
        title_original: item.title || 'Untitled',
        source_name: source.name,
        source_url: item.link || item.guid || '',
        source_feed: source.url,
        published_at: new Date(date).toISOString(),
        discovered_at: new Date().toISOString(),
        sector: sectorFrom(text, source.sector),
        technologies: tagsFrom(text),
        relevance_score: score(item, source),
        editorial_fit_score: fit,
        summary_source: (item.contentSnippet || '').replace(/\s+/g,' ').trim().slice(0, 700),
        editorial: {
          title_tr: '',
          dek_tr: '',
          summary_tr: '',
          why_it_matters_tr: '',
          seo_title: '',
          meta_description: '',
          hero_image: '',
          reviewed: false
        }
      });
    }
    return {
      source: source.name,
      url: source.url,
      ok: true,
      duration_ms: Date.now()-started,
      items
    };
  } catch (error) {
    return {
      source: source.name,
      url: source.url,
      ok: false,
      duration_ms: Date.now()-started,
      error: String(error?.message || error),
      items: []
    };
  }
}

const results = await Promise.all(sources.map(collectSource));
const fresh = [];

for (const result of results) {
  for (const item of result.items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    fresh.push(item);
  }
}

const merged = [...fresh, ...previous]
  .sort((a,b) => (b.relevance_score - a.relevance_score) || (Date.parse(b.published_at)-Date.parse(a.published_at)))
  .slice(0, 250);

const health = results.map(r => ({
  source: r.source,
  url: r.url,
  ok: r.ok,
  duration_ms: r.duration_ms,
  candidates_found: r.items.length,
  error: r.error || null,
  checked_at: new Date().toISOString()
}));

await fs.mkdir(new URL('../agent/drafts/', import.meta.url), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(merged, null, 2) + '\n');
await fs.writeFile(HEALTH, JSON.stringify(health, null, 2) + '\n');

console.log(JSON.stringify({
  sources: sources.length,
  sources_ok: health.filter(x => x.ok).length,
  sources_failed: health.filter(x => !x.ok).length,
  new_candidates: fresh.length,
  total_candidates: merged.length
}, null, 2));
for (const h of health.filter(x => !x.ok)) console.error('[source-error]', h.source, h.error);
