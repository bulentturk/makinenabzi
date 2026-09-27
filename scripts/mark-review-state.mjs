import fs from 'node:fs/promises';

const id = process.argv[2];
const state = process.argv[3];
if (!id || !['published','rejected'].includes(state)) {
  throw new Error('Usage: node scripts/mark-review-state.mjs <id> <published|rejected>');
}

const file = new URL('../agent/drafts/news-candidates.json', import.meta.url);
const candidates = JSON.parse(await fs.readFile(file,'utf8'));
const item = candidates.find(x => x.id === id);
if (!item) {
  console.log(JSON.stringify({updated:false,reason:'candidate-not-found',id,state}));
  process.exit(0);
}

item.status = state;
item.editorial = {
  ...item.editorial,
  reviewed: state === 'published',
  reviewed_at: new Date().toISOString(),
  review_result: state
};

await fs.writeFile(file,JSON.stringify(candidates,null,2)+'\n');
console.log(JSON.stringify({updated:true,id,state}));
