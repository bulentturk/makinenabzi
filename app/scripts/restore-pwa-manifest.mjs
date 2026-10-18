/**
 * `npm run assets:generate` sonrası PWA manifestini geri yükler.
 *
 * @capacitor/assets, Android ikonlarını üretirken `public/manifest.webmanifest`
 * dosyasını da yeniden yazar: ikon yollarını `../icons/*.webp` yapar (public
 * dışında kalır, tarayıcıdan erişilemez), MIME tipini `image/png` bırakır ve
 * `background_color` değerini `"'#0b1722'"` gibi bozuk bir dizeye çevirir.
 * Ayrıca `brand-mark.svg` / `app-icon-maskable.svg` dosyalarını siler.
 *
 * Bu betik, `resources/manifest.webmanifest` şablonunu geri kopyalar ve
 * `app/icons/` altında kalan artık dosyaları temizler. Böylece Android
 * ikonları güncellenirken web manifesti bozulmaz.
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const resources = join(appRoot, "resources");
const strayIcons = join(appRoot, "icons");

/** Şablon → hedef eşlemesi: araç bu dosyaları siliyor/bozuyor. */
const restores = [
  ["manifest.webmanifest", join("public", "manifest.webmanifest")],
  ["brand-mark.svg", join("public", "brand-mark.svg")],
  ["app-icon-maskable.svg", join("public", "app-icon-maskable.svg")],
];

for (const [source, targetRelative] of restores) {
  const from = join(resources, source);
  const to = join(appRoot, targetRelative);
  if (!existsSync(from)) {
    console.error(`[assets] Şablon bulunamadı: resources/${source}`);
    process.exit(1);
  }
  cpSync(from, to);
  console.log(`[assets] ${targetRelative} geri yüklendi`);
}

if (existsSync(strayIcons)) {
  rmSync(strayIcons, { recursive: true, force: true });
  console.log("[assets] app/icons/ temizlendi");
}
