import fs from 'node:fs/promises';

const file = new URL('../agent/drafts/source-health.json', import.meta.url);
let health;
try { health = JSON.parse(await fs.readFile(file,'utf8')); } catch { health = []; }

const fresh = health.length && health.every(item => Date.now() - Date.parse(item.checked_at) < 20 * 60 * 1000);
const report = fresh ? [
  '### Haber kaynağı sağlığı',
  '',
  '| Kaynak | Durum | Son akış | Güncel | İlgili | Yeni aday |',
  '| --- | --- | ---: | ---: | ---: | ---: |',
  ...health.map(item => `| ${item.source.replaceAll('|','\\|')} | ${item.ok ? 'OK' : `Hata: ${String(item.error).replaceAll('|','\\|')}`} | ${item.feed_items_seen ?? 0} | ${item.items_in_window ?? 0} | ${item.relevant_items ?? 0} | ${item.candidates_found} |`)
] : ['### Haber kaynağı sağlığı', '', 'Bu çalışmada yeni kaynak taraması yapılmadı.'];

const markdown = report.join('\n') + '\n';
console.log(markdown);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
