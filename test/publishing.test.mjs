import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const idA = 'aaaaaaaaaaaaaaaa';
const idB = 'bbbbbbbbbbbbbbbb';
const draft = (id, score = 80) => ({
  id, status: 'drafted', title_original: 'Equipment update', summary_source: 'Equipment update from manufacturer',
  source_name: 'Source', source_url: `https://example.com/${id}`, published_at: '2026-10-18T12:00:00Z',
  sector: 'marine-yatcilik', technologies: [], editorial_fit_score: score, relevance_score: 10,
  editorial: { title_tr: `Haber ${id}`, summary_tr: 'Kaynak metninde bulunan teknik gelişme. '.repeat(10), key_facts: ['Olgu 1', 'Olgu 2'], uncertainty_notes: [] }
});

async function fixture() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-flow-'));
  const candidates = path.join(dir, 'candidates.json');
  const published = path.join(dir, 'published.json');
  const sources = path.join(dir, 'sources.json');
  await Promise.all([
    fs.writeFile(candidates, JSON.stringify([draft(idA, 100), draft(idB)])),
    fs.writeFile(published, '[]'),
    fs.writeFile(sources, JSON.stringify([{ name: 'Source' }]))
  ]);
  return { dir, candidates, published, sources };
}

function run(script, env) {
  const result = spawnSync(process.execPath, [new URL(`scripts/${script}`, root).pathname],
    { env: { ...process.env, ...env }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('weekday publication excludes an open PR and publishes only once', async () => {
  const f = await fixture();
  try {
    const env = { AUTO_CANDIDATES_FILE: f.candidates, AUTO_PUBLISHED_FILE: f.published,
      AUTO_SOURCES_FILE: f.sources, AUTO_EXCLUDED_IDS: idA, AUTO_NOW: '2026-10-19T06:17:00Z' };
    run('auto-publish.mjs', env);
    run('auto-publish.mjs', env);
    const published = JSON.parse(await fs.readFile(f.published, 'utf8'));
    const candidates = JSON.parse(await fs.readFile(f.candidates, 'utf8'));
    assert.deepEqual(published.map(item => item.id), [idB]);
    assert.equal(published[0].publish_mode, 'automatic');
    assert.equal(candidates.find(item => item.id === idA).status, 'drafted');
  } finally { await fs.rm(f.dir, { recursive: true, force: true }); }
});

test('weekend and inaccessible sources do not auto publish', async () => {
  const f = await fixture();
  try {
    const env = { AUTO_CANDIDATES_FILE: f.candidates, AUTO_PUBLISHED_FILE: f.published,
      AUTO_SOURCES_FILE: f.sources, AUTO_NOW: '2026-10-18T06:17:00Z' };
    run('auto-publish.mjs', env);
    assert.deepEqual(JSON.parse(await fs.readFile(f.published, 'utf8')), []);
    const candidates = JSON.parse(await fs.readFile(f.candidates, 'utf8'));
    candidates.forEach(item => item.editorial.uncertainty_notes.push('Kaynak sayfası 403 nedeniyle erişilemedi.'));
    await fs.writeFile(f.candidates, JSON.stringify(candidates));
    run('auto-publish.mjs', { ...env, AUTO_NOW: '2026-10-19T06:17:00Z' });
    assert.deepEqual(JSON.parse(await fs.readFile(f.published, 'utf8')), []);
  } finally { await fs.rm(f.dir, { recursive: true, force: true }); }
});

test('selection skips already published and excluded IDs', async () => {
  const { selectDraft } = await import('../scripts/publish-news.mjs');
  const items = [draft(idA, 100), draft(idB, 80)];
  assert.equal(selectDraft(items, [], [{ name: 'Source' }], [idA]).id, idB);
  assert.equal(selectDraft(items, [{ id: idA }], [{ name: 'Source' }]).id, idB);
});

test('approval queue reserves the best eligible story for automatic publication', async () => {
  const f = await fixture();
  try {
    const env = { REVIEW_CANDIDATES_FILE: f.candidates, REVIEW_PUBLISHED_FILE: f.published,
      REVIEW_SOURCES_FILE: f.sources, REVIEW_TMP_DIR: f.dir, REVIEW_NOW: '2026-10-19T05:30:00Z' };
    run('prepare-review-pr.mjs', env);
    assert.equal((await fs.readFile(path.join(f.dir, 'review-id.txt'), 'utf8')).trim(), idB);
    const candidates = JSON.parse(await fs.readFile(f.candidates, 'utf8'));
    candidates.splice(1);
    await fs.writeFile(f.candidates, JSON.stringify(candidates));
    run('prepare-review-pr.mjs', env);
    assert.equal((await fs.readFile(path.join(f.dir, 'review-count.txt'), 'utf8')).trim(), '0');
  } finally { await fs.rm(f.dir, { recursive: true, force: true }); }
});

test('merged approval materializes only its article and is safe to retry', async () => {
  const f = await fixture();
  try {
    const requests = path.join(f.dir, 'requests');
    await fs.mkdir(requests);
    await fs.writeFile(path.join(requests, `${idA}.json`), JSON.stringify({ id: idA, title: 'Approved story', site_published_at: '2026-10-18T00:00:00Z' }));
    const env = { REVIEW_CANDIDATES_FILE: f.candidates, REVIEW_PUBLISHED_FILE: f.published, REVIEW_REQUESTS_DIR: requests };
    for (let i = 0; i < 2; i++) {
      const result = spawnSync(process.execPath, [new URL('scripts/finalize-review.mjs', root).pathname, idA, 'published'],
        { env: { ...process.env, ...env }, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    }
    const published = JSON.parse(await fs.readFile(f.published, 'utf8'));
    assert.equal(published.length, 1);
    assert.equal(published[0].publish_mode, 'approved');
    assert.equal(JSON.parse(await fs.readFile(f.candidates, 'utf8'))[0].status, 'published');
  } finally { await fs.rm(f.dir, { recursive: true, force: true }); }
});
