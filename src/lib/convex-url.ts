/**
 * Site üye ekranlarının bağlanacağı Convex dağıtımı.
 *
 * Convex adresi gizli bilgi değildir; ancak yanlış dağıtıma bağlanmak üye
 * verisini görünmez kılar. Bu yüzden:
 * - Üretim derlemesi (GitHub Pages) her zaman üretim dağıtımına gider.
 * - `PUBLIC_CONVEX_URL` tanımlıysa o kullanılır (ör. önizleme dağıtımı).
 * - Yerel geliştirme, `npx convex dev`in bağladığı geliştirme dağıtımını kullanır.
 *
 * Not: `??` yerine `||` kullanılıyor; CI'da tanımsız bir secret boş dize
 * olarak gelir ve boş URL istemciyi kilitler.
 */
const PROD_URL = "https://good-ptarmigan-779.convex.cloud";
const DEV_URL = "https://flexible-ibex-197.eu-west-1.convex.cloud";

export const CONVEX_URL =
  import.meta.env.PUBLIC_CONVEX_URL ||
  (import.meta.env.PROD ? PROD_URL : DEV_URL);
