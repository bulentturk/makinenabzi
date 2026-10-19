#!/usr/bin/env node
/**
 * Yayın duman testi.
 *
 * Dağıtımdan sonra site ayakta mı ve üye giriş sayfası doğru Convex
 * dağıtımına mı bağlanıyor? Bu iki soruyu yayındaki gerçek dosyalar üzerinden
 * yanıtlar; derleme başarılı olsa bile yanlış dağıtıma bağlanan bir sayfayı
 * yakalar (bir kez yaşandı: sayfa geliştirme dağıtımına düşmüştü).
 *
 * Kontroller:
 *   1. `/hesap/` 200 döner, HTML ve beklenen başlık gelir.
 *   2. Sayfa üretim Convex adresine bağlanır; geliştirme adresi sızmamıştır.
 *   3. Sayfanın yüklediği giriş adası betiği 200 döner.
 *   4. `/hesabim/` 200 döner ve aynı üretim adresine bağlanır.
 *   5. Convex dağıtımı herkese açık `listings:sectorStats` sorgusuna cevap verir.
 *
 * Kullanım:
 *   node scripts/smoke-test.mjs
 *   SMOKE_BASE_URL=http://localhost:4321 node scripts/smoke-test.mjs
 *   EXPECTED_CONVEX_URL=https://ornek.convex.cloud node scripts/smoke-test.mjs
 */

const BASE = (process.env.SMOKE_BASE_URL || 'https://makinenabzi.com').replace(/\/+$/, '');
// Üretim dağıtımı. Gizli bilgi değil; yanlış dağıtıma bağlanmayı yakalamak için sabit.
const EXPECTED_CONVEX = (
  process.env.EXPECTED_CONVEX_URL || 'https://good-ptarmigan-779.convex.cloud'
).replace(/\/+$/, '');
const DEV_DEPLOYMENT = 'flexible-ibex-197';
const TIMEOUT_MS = 15_000;
const ATTEMPTS = 3;

const passed = [];
const failed = [];

function pass(name) {
  passed.push(name);
  console.log(`✔ ${name}`);
}

function fail(name, reason) {
  failed.push(`${name}: ${reason}`);
  console.error(`✖ ${name}: ${reason}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Geçici ağ/5xx hatalarında yeniden dener. Yayın yeni tamamlandığında CDN birkaç
 * saniye eski sürümü tutabiliyor; bu yüzden tek denemede pes etmiyoruz.
 */
async function request(url, init = {}) {
  let lastError = new Error('bilinmeyen hata');
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status >= 500 && attempt < ATTEMPTS) {
        lastError = new Error(`HTTP ${res.status}`);
        await sleep(attempt * 1000);
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) await sleep(attempt * 1000);
    }
  }
  throw lastError;
}

function convexUrlsIn(html) {
  return [...new Set(html.match(/https:\/\/[a-z0-9-]+\.convex\.cloud/g) ?? [])];
}

function describeConvex(html) {
  return convexUrlsIn(html).join(', ') || 'Convex adresi bulunamadı';
}

async function fetchPage(path) {
  const res = await request(`${BASE}${path}`);
  const html = await res.text();
  return { res, html };
}

async function main() {
  console.log(`Duman testi: ${BASE}`);
  console.log(`Beklenen Convex dağıtımı: ${EXPECTED_CONVEX}\n`);

  // 1. Giriş sayfası ayakta mı?
  const { res: hesapRes, html: hesapHtml } = await fetchPage('/hesap/');
  const contentType = hesapRes.headers.get('content-type') ?? '';
  if (hesapRes.status !== 200) {
    fail('/hesap/ 200 döner', `HTTP ${hesapRes.status}`);
  } else if (!contentType.includes('text/html')) {
    fail('/hesap/ 200 döner', `beklenmeyen içerik türü: ${contentType || 'yok'}`);
  } else if (!hesapHtml.includes('<title>Hesap')) {
    fail('/hesap/ 200 döner', 'HTML başlığında "Hesap" yok');
  } else if (!hesapHtml.includes('Hesap aç')) {
    fail('/hesap/ 200 döner', 'HTML içinde "Hesap aç" adımı yok');
  } else {
    pass('/hesap/ 200 döner ve giriş sayfasını içerir');
  }

  // 2. Doğru Convex dağıtımına mı bağlanıyor?
  const urls = convexUrlsIn(hesapHtml);
  if (hesapHtml.includes(DEV_DEPLOYMENT)) {
    fail('/hesap/ üretim Convex adresine bağlanır', `geliştirme dağıtımı sızmış (${DEV_DEPLOYMENT})`);
  } else if (!urls.includes(EXPECTED_CONVEX)) {
    fail('/hesap/ üretim Convex adresine bağlanır', `beklenen ${EXPECTED_CONVEX}, bulunan: ${describeConvex(hesapHtml)}`);
  } else {
    pass('/hesap/ üretim Convex adresine bağlanır');
  }

  // 3. Giriş adasının betiği gerçekten sunuluyor mu?
  const island = hesapHtml.match(/\/_astro\/HesapAuth\.[A-Za-z0-9_-]+\.js/);
  if (!island) {
    fail('giriş adası betiği yüklenir', 'HTML içinde HesapAuth betiği bulunamadı');
  } else {
    const islandRes = await request(`${BASE}${island[0]}`);
    const islandType = islandRes.headers.get('content-type') ?? '';
    if (islandRes.status !== 200 || !islandType.includes('javascript')) {
      fail('giriş adası betiği yüklenir', `${island[0]} → HTTP ${islandRes.status} (${islandType || 'tür yok'})`);
    } else {
      pass(`giriş adası betiği yüklenir (${island[0]})`);
    }
  }

  // 4. Hesabım sayfası da aynı dağıtıma bağlı mı?
  const { res: hesabimRes, html: hesabimHtml } = await fetchPage('/hesabim/');
  if (hesabimRes.status !== 200) {
    fail('/hesabim/ 200 döner', `HTTP ${hesabimRes.status}`);
  } else if (!convexUrlsIn(hesabimHtml).includes(EXPECTED_CONVEX)) {
    fail('/hesabim/ 200 döner', `beklenen Convex adresi yok: ${describeConvex(hesabimHtml)}`);
  } else {
    pass('/hesabim/ 200 döner ve üretim Convex adresine bağlanır');
  }

  // 5. Convex dağıtımı gerçekten cevap veriyor mu?
  const res = await request(`${EXPECTED_CONVEX}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'listings:sectorStats', args: {}, format: 'json' }),
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (res.status !== 200) {
    fail('Convex sorgusuna cevap verir', `HTTP ${res.status}`);
  } else if (payload?.status !== 'success') {
    fail('Convex sorgusuna cevap verir', payload?.errorMessage ?? 'başarısız yanıt');
  } else if (!Array.isArray(payload.value?.sectors)) {
    fail('Convex sorgusuna cevap verir', 'sectorStats beklenen biçimde değil');
  } else {
    pass('Convex sorgusuna cevap verir (listings:sectorStats)');
  }

  console.log();
  if (failed.length > 0) {
    console.error(`Duman testi başarısız: ${failed.length} kontrol düştü, ${passed.length} geçti.`);
    for (const item of failed) console.error(`  - ${item}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Duman testi geçti: ${passed.length} kontrol.`);
}

main().catch((error) => {
  console.error(`Duman testi çalıştırılamadı: ${error.message}`);
  process.exitCode = 1;
});
