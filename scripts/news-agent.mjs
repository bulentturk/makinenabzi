import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 15000 });
const sources = JSON.parse(await fs.readFile(new URL('../agent/sources.json', import.meta.url), 'utf8'));

const OUT = new URL('../agent/drafts/news-candidates.json', import.meta.url);
const DAYS = Number(process.env.NEWS_LOOKBACK_DAYS || 4);
const MAX_PER_SOURCE = Number(process.env.NEWS_MAX_PER_SOURCE || 15);
const cutoff = Date.now() - DAYS * 86400000;

const rules = [
  ['elektrifikasyon', ['electric','battery','bms','charging','charger','inverter','electrification','hybrid','hydrogen','fuel cell','zero emission']],
  ['otonomi-ai', ['autonomous','automation','ai ','artificial intelligence','machine vision','lidar','radar','driverless','remote operation']],
  ['elektronik-telematik', ['telematics','telemetry','connected','can bus','j1939','software','digital','remote monitoring','fleet management']],
  ['yuruyus-guc-aktarma', ['transmission','drivetrain','powertrain','powershift','hydrostatic','axle','differential','final drive','torque converter','gearbox']],
  ['hidrolik', ['hydraulic','pump','valve','fluid power','hydrostatic']],
  ['emisyon-stage-v', ['stage v','emission','dpf','scr','adblue','diesel exhaust']],
  ['fonksiyonel-guvenlik', ['safety','functional safety','iso 13849','collision avoidance']],
  ['termal-yonetim', ['thermal','cooling','heat management','radiator']]
];

const sectorRules = [
  ['madencilik', ['mining','mine ','underground','open pit','quarry','lhd','haul truck','drill rig']],
  ['liman', ['port ','terminal','container','reach stacker','straddle carrier','harbour','crane']],
  ['tarim', ['agriculture','agricultural','tractor','harvester','farm ','combine']],
  ['arac-ustu-ekipman', ['truck-mounted','aerial platform','concrete pump','mixer truck','refuse truck','municipal']],
  ['is-makinalari', ['excavator','loader','dozer','grader','construction equipment','compact equipment','road machinery']]
];

function normalized(s='') {
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
}
function score(item, source) {
  const text = normalized(item.title + ' ' + (item.contentSnippet || ''));
  let s = source.priority || 50;
  s += tagsFrom(text).length * 8;
  if (/(launch|introduc|new |electric|autonom|battery|technology|system|platform|retrofit)/.test(text)) s += 10;
  return s;
}
function idFor(url,title) {
  return crypto.createHash('sha1').update(url || title).digest('hex').slice(0,16);
}

let previous = [];
try { previous = JSON.parse(await fs.readFile(OUT,'utf8')); } catch {}
const seen = new Set(previous.map(x => x.id));
const fresh = [];

for (const source of sources) {
  try {
    const feed = await parser.parseURL(source.url);
    for (const item of (feed.items || []).slice(0, MAX_PER_SOURCE)) {
      const date = Date.parse(item.isoDate || item.pubDate || '') || Date.now();
      if (date < cutoff) continue;
      const id = idFor(item.link || item.guid || '', item.title || '');
      if (seen.has(id)) continue;

      const text = [item.title, item.contentSnippet, item.content].filter(Boolean).join(' ');
      fresh.push({
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
      seen.add(id);
    }
  } catch (error) {
    console.error('[source-error]', source.name, error.message);
  }
}

const merged = [...fresh, ...previous]
  .sort((a,b) => (b.relevance_score - a.relevance_score) || (Date.parse(b.published_at)-Date.parse(a.published_at)))
  .slice(0, 250);

await fs.mkdir(new URL('../agent/drafts/', import.meta.url), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(JSON.stringify({sources:sources.length,new_candidates:fresh.length,total_candidates:merged.length}, null, 2));
