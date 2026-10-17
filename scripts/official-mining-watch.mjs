import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const SOURCES = new URL('../agent/official-mining-sources.json', import.meta.url);
const LEADS = new URL('../agent/drafts/official-mining-leads.json', import.meta.url);
const HEALTH = new URL('../agent/drafts/official-mining-health.json', import.meta.url);
const sources = JSON.parse(await fs.readFile(SOURCES, 'utf8'));
let existing = [];
try { existing = JSON.parse(await fs.readFile(LEADS, 'utf8')); } catch {}
const already = new Map(existing.map(item => [item.id,item]));

function plain(text='') {
  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]*>/g,' ')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'").replace(/&nbsp;/gi,' ')
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/\s+/g,' ').trim();
}

function sameHost(a,b) {
  return a.hostname.replace(/^www\./,'') === b.hostname.replace(/^www\./,'');
}

const topic = /\b(underground|mining|mine|loader|haul|truck|drill|bolter|scaler|shotcrete|emulsion|charging|autonom|automation|battery|electric|equipment|vehicle|fleet|rock|tunnel|safety|support|hydraulic|hydrostatic|robotic|remote|new|launch|innovation|elektr|yeralt|maden)\b/i;

function findLinks(html,source) {
  const base = new URL(source.url);
  const matches = [...html.matchAll(/<a\b([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)];
  const pattern = new RegExp(source.article_path,'i');
  const found = new Map();
  for (const match of matches) {
    let uri;
    try { uri = new URL(match[2],base); } catch { continue; }
    if (!/^https?:$/.test(uri.protocol) || !sameHost(uri,base) || !pattern.test(uri.pathname)) continue;
    uri.hash='';uri.search='';
    const title = plain(match[4]);
    if (title.length < 26 || title.length > 260 || !topic.test(title)) continue;
    const id=crypto.createHash('sha1').update(uri.href).digest('hex').slice(0,16);
    found.set(id,{id,source_name:source.name,source_url:uri.href,title_original:title,
      sector:'madencilik',subsector:'yeraltı-madenciliği',
      status:'lead',source_type:'official_manufacturer',verified_publication_date:false,
      first_seen_at:already.get(id)?.first_seen_at || new Date().toISOString()});
  }
  return [...found.values()].slice(0,25);
}

async function scan(source) {
  const time=Date.now();
  try {
    let html='';
    let fetchedUrl='';
    let lastError='';
    for (const candidateUrl of [source.url,...(source.fallback_urls || [])]) {
      try {
        const response=await fetch(candidateUrl,{
          signal:AbortSignal.timeout(15000),
          headers:{'user-agent':'MakineNabziOEMWatch/1.0 (+https://makinenabzi.com)','accept':'text/html'}
        });
        if(!response.ok)throw new Error('HTTP '+response.status);
        const body=await response.text();
        if(!/html/i.test(response.headers.get('content-type') || '') && !/<html/i.test(body))
          throw new Error('HTML expected');
        html=body;
        fetchedUrl=candidateUrl;
        break;
      } catch(e) { lastError=String(e?.message || e); }
    }
    if (!fetchedUrl)throw new Error(lastError || 'All source URLs unavailable');
    const items=findLinks(html,{...source,url:fetchedUrl});
    const unseen=items.filter(x=>!already.has(x.id));
    return {source:source.name,url:fetchedUrl,ok:true,links:items.length,new_links:unseen.length,
      checked_at:new Date().toISOString(),duration_ms:Date.now()-time,items};
  } catch(error) {
    return {source:source.name,url:source.url,ok:false,links:0,new_links:0,
      checked_at:new Date().toISOString(),duration_ms:Date.now()-time,
      error:String(error?.message || error),items:[]};
  }
}
const results=await Promise.all(sources.map(scan));
const discovered=results.flatMap(r=>r.items);
const unique=new Map(existing.map(x=>[x.id,x]));
for (const item of discovered) unique.set(item.id,item);
const ordered=[...unique.values()].sort((a,b)=>Date.parse(b.first_seen_at)-Date.parse(a.first_seen_at)).slice(0,250);

await fs.mkdir(new URL('../agent/drafts/',import.meta.url),{recursive:true});
await fs.writeFile(LEADS,JSON.stringify(ordered,null,2)+'\n');
await fs.writeFile(HEALTH,JSON.stringify(results.map(({items,...r})=>r),null,2)+'\n');
console.log(JSON.stringify({sources:sources.length,ok:results.filter(x=>x.ok).length,
  failed:results.filter(x=>!x.ok).length,new_leads:results.reduce((a,b)=>a+b.new_links,0),
  total_leads:ordered.length,source_health:results.map(({items,...r})=>r)},null,2));
