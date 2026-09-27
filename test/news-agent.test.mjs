import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const script = new URL('../scripts/news-agent.mjs', import.meta.url).pathname;
const articleId = url => crypto.createHash('sha1').update(url).digest('hex').slice(0,16);

async function runAgent({ sources, candidates=[], published=[] }) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'makinenabzi-news-'));
  const paths = Object.fromEntries(['sources','candidates','published','health'].map(name => [name,path.join(dir,`${name}.json`)]));
  await Promise.all([
    fs.writeFile(paths.sources,JSON.stringify(sources)),
    fs.writeFile(paths.candidates,JSON.stringify(candidates)),
    fs.writeFile(paths.published,JSON.stringify(published))
  ]);
  try {
    const result = spawnSync(process.execPath,[script],{
      encoding:'utf8',
      env:{...process.env,NEWS_SOURCES_FILE:paths.sources,NEWS_CANDIDATES_FILE:paths.candidates,NEWS_PUBLISHED_FILE:paths.published,NEWS_HEALTH_FILE:paths.health}
    });
    return {
      result,
      candidates: JSON.parse(await fs.readFile(paths.candidates,'utf8')),
      health: JSON.parse(await fs.readFile(paths.health,'utf8'))
    };
  } finally {
    await fs.rm(dir,{recursive:true,force:true});
  }
}

test('keeps pending drafts, skips published IDs and passenger EV stories, recognizes Turkish machinery', async () => {
  const date = new Date().toUTCString();
  const feed = `<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title>
    <item><title>New electric car charging for commuters</title><link>https://example.org/car</link><pubDate>${date}</pubDate><description>Passenger car battery technology and faster charging.</description></item>
    <item><title>Electric mining truck battery system launched</title><link>https://example.org/published</link><pubDate>${date}</pubDate><description>Off-highway mining truck batteries.</description></item>
    <item><title>Yeni elektrikli ekskavatör ve hidrolik pompa tanıtıldı</title><link>https://example.org/ekskavator</link><pubDate>${date}</pubDate><description>İş makinası ve maden sahası için sistem.</description></item>
  </channel></rss>`;
  const sources = [{name:'electrive',url:`data:application/rss+xml,${encodeURIComponent(feed)}`,sector:'elektrifikasyon',priority:90,require_mobile_context:true}];
  const oldDraft = {id:'awaiting-review',status:'drafted',published_at:'2026-08-01T00:00:00.000Z',source_name:'electrive',title_original:'Old draft',summary_source:'',editorial:{title_tr:'Onay bekliyor'}};
  const {result,candidates,health} = await runAgent({sources,candidates:[oldDraft],published:[{id:articleId('https://example.org/published')}]});
  assert.equal(result.status,0,result.stderr);
  assert.deepEqual(new Set(candidates.map(item=>item.id)),new Set(['awaiting-review',articleId('https://example.org/ekskavator')]));
  assert.equal(candidates.find(item=>item.id==='awaiting-review').status,'drafted');
  assert.equal(candidates.find(item=>item.source_url==='https://example.org/ekskavator').sector,'madencilik');
  assert.equal(health[0].feed_items_seen,3);
  assert.equal(health[0].candidates_found,1);
});

test('alerts when every source fails', async () => {
  const {result,health} = await runAgent({sources:[{name:'Broken',url:'data:application/rss+xml,%3Cbroken',sector:'madencilik'}]});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/All news sources failed/);
  assert.equal(health[0].ok,false);
});
