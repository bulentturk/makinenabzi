import fs from 'node:fs/promises';

const [id, state] = process.argv.slice(2);
if (!/^[a-f0-9]{16}$/.test(id || '') || !['published', 'rejected'].includes(state)) {
  throw new Error('Usage: node scripts/finalize-review.mjs <16-character candidate id> <published|rejected>');
}

const candidatesFile = process.env.REVIEW_CANDIDATES_FILE || new URL('../agent/drafts/news-candidates.json', import.meta.url);
const publishedFile = process.env.REVIEW_PUBLISHED_FILE || new URL('../src/data/published-news.json', import.meta.url);
const requestFile = process.env.REVIEW_REQUESTS_DIR
  ? new URL(`${id}.json`, `file://${process.env.REVIEW_REQUESTS_DIR.replace(/\/$/, '')}/`)
  : new URL(`../agent/publish-requests/${id}.json`, import.meta.url);
const [candidates, published] = await Promise.all([candidatesFile, publishedFile]
  .map(async file => JSON.parse(await fs.readFile(file, 'utf8'))));
const candidate = candidates.find(item => item.id === id);
const existing = published.some(item => item.id === id);

if (state === 'published' && !existing) {
  const request = JSON.parse(await fs.readFile(requestFile, 'utf8'));
  if (request.id !== id) throw new Error('Approval request ID does not match PR branch');
  // The PR contains a single article. Its merge does not rewrite the live news feed.
  published.unshift({ ...request, site_published_at: new Date().toISOString(), publish_mode: 'approved' });
  await fs.writeFile(publishedFile, JSON.stringify(published, null, 2) + '\n');
}

if (candidate) {
  candidate.status = state;
  candidate.editorial = {
    ...candidate.editorial,
    reviewed: state === 'published',
    reviewed_at: new Date().toISOString(),
    review_result: state
  };
  await fs.writeFile(candidatesFile, JSON.stringify(candidates, null, 2) + '\n');
}
console.log(JSON.stringify({ id, state, candidateFound: Boolean(candidate), alreadyPublished: existing }));
