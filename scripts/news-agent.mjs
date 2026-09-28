import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import Parser from 'rss-parser';
import { normalized, hasTerm, hasMobileContext, hasSectorEquipmentContext } from './news-context.mjs';

const parser = new Parser({ timeout: 12000 });
const sources = JSON.parse(await fs.readFile(process.env.NEWS_SOURCES_FILE || new URL('../agent/sources.json', import.meta.url), 'utf8'));

const OUT = process.env.NEWS_CANDIDATES_FILE || new URL('../agent/drafts/news-candidates.json', import.meta.url);
const HEALTH = process.env.NEWS_HEALTH_FILE || new URL('../agent/drafts/source-health.json', import.meta.url);
const PUBLISHED = process.env.NEWS_PUBLISHED_FILE || new URL('../src/data/published-news.json', import.meta.url);
const DAYS = Number(process.env.NEWS_LOOKBACK_DAYS || 4);
const MAX_PER_SOURCE = Number(process.env.NEWS_MAX_PER_SOURCE || 15);
const cutoff = Date.now() - DAYS * 86400000;

const rules = [
  ['elektrifikasyon', ['electric','battery','bms','charging','charger','inverter','electrification','hybrid','fuel cell','zero emission','dc-dc','motor controller','axial flux','e-axle','shore power','elektrikli','batarya','sarj','hibrit']],
  ['otonomi-ai', ['autonomous','automation','ai ','artificial intelligence','machine vision','lidar','radar','driverless','remote operation']],
  ['elektronik-telematik', ['telematics','telemetry','connected','can bus','j1939','canopen','software','digital','remote monitoring','fleet management','sensor','encoder','controller','ecu','vcu','hmi','joystick','drive-by-wire','steer-by-wire','telematik','uzaktan izleme','kontrol unitesi']],
  ['yuruyus-guc-aktarma', ['transmission','drivetrain','powertrain','powershift','hydrostatic','axle','differential','final drive','torque converter','gearbox']],
  ['hidrolik', ['hydraulic','pump','valve','fluid power','hydrostatic','hidrolik','pompa','valf']],
  ['emisyon-stage-v', ['stage v','tier 4','dpf','scr','adblue','diesel exhaust','aftertreatment']],
  ['fonksiyonel-guvenlik', ['safety','functional safety','iso 13849','collision avoidance','fail-safe','redundant control','sil 2','sil 3']],
  ['termal-yonetim', ['thermal','cooling','heat management','radiator']]
];

const sectorRules = [
  ['havaalani-gse', ['ground support equipment','ground handling equipment','gse','aircraft tug','aircraft towing','pushback tractor','baggage tractor','baggage tug','belt loader','cargo loader','ground power unit','de-icing truck','passenger stairs','airport fire truck','airside vehicle','apron vehicle']],
  ['marine-yatcilik', ['marine propulsion','marine engine','boat engine','outboard motor','inboard motor','electric boat','electric yacht','electric ferry','hybrid vessel','workboat','thruster','deck machinery','shore power','yacht equipment','ship propulsion']],
  ['madencilik', ['mining','mine','open pit','quarry','lhd','haul truck','drill rig','maden','madencilik','yer alti','acik ocak']],
  ['liman', ['port','terminal','container','reach stacker','straddle carrier','harbour crane','liman','konteyner','vinc']],
  ['tarim', ['agriculture','agricultural','tractor','harvester','farm ','combine','tarim','traktor','bicerdover']],
  ['arac-ustu-ekipman', ['truck-mounted','aerial platform','concrete pump','mixer truck','refuse truck','municipal']],
  ['is-makinalari', ['excavator','loader','dozer','grader','construction equipment','compact equipment','road machinery','is makinasi','ekskavator','yukleyici','greyder']]
];

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
  'diesel engine','combustion engine','engine platform','aftertreatment','stage v engine',
  'transmission','powershift','powertrain','drivetrain','hydrostatic','final drive','axle','differential',
  'hydraulic','inverter','electric motor','bms','telematics','telemetry','fleet management',
  'autonomous haulage','autonomous transport','remote operation','collision avoidance',
  'machine vision','camera system','charging system','battery electric',
  'sensor','encoder','controller','joystick','hmi','ecu','vcu','can bus','j1939','canopen',
  'steer-by-wire','drive-by-wire','actuator','motor controller','dc-dc','e-axle','axial flux',
  'ground support equipment','gse','pushback tractor','aircraft tug','baggage tractor','belt loader','cargo loader','ground power unit',
  'marine propulsion','marine engine','outboard motor','electric boat','workboat','thruster','deck machinery','shore power',
  'is makinasi','ekskavator','yukleyici','greyder','vinc','maden kamyonu','delici makine',
  'traktor','bicerdover','liman ekipmani','hidrolik','pompa','valf','guc aktarimi',
  'elektrik motoru','telematik','kontrol unitesi','sensor','sanziman'
];
const weakBusinessTerms = [
  'apprentice','graduate','reconciliation action plan','merger','acquisition','supply resilience',
  'funding boost','career opportunities','copper market','commodity','water treatment'
];
function editorialFit(item, source) {
  const text = normalized(item.title + ' ' + (item.contentSnippet || ''));
  const title = normalized(item.title || '');
  if (source.require_mobile_context && !hasMobileContext(text)) return 0;
  if (source.require_equipment_context && !hasSectorEquipmentContext(text,source.require_equipment_context)) return 0;
  const tags = tagsFrom(text);
  let fit = 0;
  if (machineryTerms.some(w => hasTerm(text, w))) fit += 55;
  fit += tags.length * 12;
  if (['launch','introduces','introduce','new','fleet','system','platform','retrofit','upgrade'].some(w => hasTerm(title, w))) fit += 10;
  if (weakBusinessTerms.some(w => hasTerm(text, w))) fit -= 30;
  if (source.sector === 'liman' && ['equipment','terminal operations','crane','reach stacker'].some(w => hasTerm(text,w))) fit += 10;
  if (source.sector === 'madencilik' && ['autonomous','battery electric','haul truck','lhd','drill rig','equipment'].some(w => hasTerm(text,w))) fit += 10;
  if (source.sector === 'marine-yatcilik' && ['marine propulsion','electric boat','battery','thruster','shore power','deck machinery'].some(w => hasTerm(text,w))) fit += 12;
  if (source.sector === 'havaalani-gse' && ['ground support equipment','aircraft tug','pushback tractor','belt loader','ground power unit','baggage tractor'].some(w => hasTerm(text,w))) fit += 12;
  if (source.focus === 'powertrain' && ['diesel engine','transmission','drivetrain','axle','aftertreatment','powershift'].some(w => hasTerm(text,w))) fit += 12;
  if (['sensor','encoder','controller','inverter','motor controller','actuator','dc-dc','e-axle','axial flux'].some(w => hasTerm(text,w)) && ['launch','introduces','unveils','new'].some(w => hasTerm(title,w))) fit += 12;
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
const publishedIds = new Set(JSON.parse(await fs.readFile(PUBLISHED,'utf8')).map(item => item.id));

const sourceByName = new Map(sources.map(source => [source.name, source]));
previous = previous
  .filter(item => item.status === 'drafted' || (Date.parse(item.published_at || '') || 0) >= cutoff)
  .map(item => {
    const source = sourceByName.get(item.source_name) || {
      name: item.source_name,
      sector: item.sector || 'is-makinalari',
      priority: 50
    };
    const pseudo = {
      title: item.title_original || '',
      contentSnippet: item.summary_source || ''
    };
    const text = [pseudo.title, pseudo.contentSnippet].join(' ');
    const fit = editorialFit(pseudo, source);
    return {
      ...item,
      sector: sectorFrom(text, source.sector),
      technologies: tagsFrom(text),
      editorial_fit_score: fit,
      relevance_score: score(pseudo, source)
    };
  })
  .filter(item => item.status === 'drafted' || item.editorial_fit_score >= 30);

const seen = new Set([...previous.map(x => x.id), ...publishedIds]);

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
    let inWindow = 0;
    let relevant = 0;
    for (const item of (feed.items || []).slice(0, MAX_PER_SOURCE)) {
      const date = Date.parse(item.isoDate || item.pubDate || '');
      if (!Number.isFinite(date) || date < cutoff || date > Date.now() + 86400000) continue;
      inWindow++;
      const id = idFor(item.link || item.guid || '', item.title || '');

      const text = [item.title, item.contentSnippet, item.content].filter(Boolean).join(' ');
      const fit = editorialFit(item, source);
      if (fit < 30) continue;
      relevant++;
      if (seen.has(id)) continue;
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
      feed_items_seen: Math.min(feed.items?.length || 0, MAX_PER_SOURCE),
      items_in_window: inWindow,
      relevant_items: relevant,
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
  .sort((a,b) => (b.relevance_score - a.relevance_score) || (Date.parse(b.published_at)-Date.parse(a.published_at)));
// A pending human review must never disappear just because 250 newer candidates arrived.
const protectedDrafts = merged.filter(item => item.status === 'drafted');
const capped = [...protectedDrafts, ...merged.filter(item => item.status !== 'drafted').slice(0, Math.max(0, 250-protectedDrafts.length))]
  .sort((a,b) => (b.relevance_score - a.relevance_score) || (Date.parse(b.published_at)-Date.parse(a.published_at)));

const health = results.map(r => ({
  source: r.source,
  url: r.url,
  ok: r.ok,
  duration_ms: r.duration_ms,
  feed_items_seen: r.feed_items_seen ?? 0,
  items_in_window: r.items_in_window ?? 0,
  relevant_items: r.relevant_items ?? 0,
  candidates_found: r.items.length,
  error: r.error || null,
  checked_at: new Date().toISOString()
}));

await fs.mkdir(new URL('../agent/drafts/', import.meta.url), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(capped, null, 2) + '\n');
await fs.writeFile(HEALTH, JSON.stringify(health, null, 2) + '\n');

console.log(JSON.stringify({
  sources: sources.length,
  sources_ok: health.filter(x => x.ok).length,
  sources_failed: health.filter(x => !x.ok).length,
  new_candidates: fresh.length,
  total_candidates: capped.length,
  pending_review: protectedDrafts.length
}, null, 2));
for (const h of health.filter(x => !x.ok)) console.error('[source-error]', h.source, h.error);
if (health.length && health.every(x => !x.ok)) throw new Error('All news sources failed; check the feed URLs and source health log.');
