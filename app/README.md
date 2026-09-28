# Makine Nabzı — Uygulama (`app/`)

makinenabzi.com'un mobil istemcisi. Astro sitesi yayın merkezidir (SEO, RSS,
sitemap, editoryal onay); bu klasör o yayının **okuyan istemcisidir**: bildirimler,
sektör takibi, fuar takvimi ve kaynak kütüphanesi burada yaşar.

## Yığın

Vite 7 · React 19 · TypeScript · Convex (backend + veritabanı) · Convex Auth
(e-posta OTP + misafir) · Tailwind v4 · shadcn/ui · Framer Motion · Bun

## İçerik nereden geliyor

Uygulama ajanın ürettiği içeriği **doğrudan** tüketmez; yalnızca insan onayından
geçmiş yayını okur. Sırayla şu adresleri dener ve ilk çalışanı kullanır:

1. `NEWS_FEED_JSON_URL` (yalnızca geçici test için)
2. `https://makinenabzi.com/feed.json` — yapılandırılmış, onaylı içerik
3. `https://makinenabzi.com/rss.xml` + makale sayfaları (yedek)

Yani uygulamaya düşen her haber, sitede yayınlanmış haberle birebir aynıdır.
Dosya biçimi `src/convex/siteFeed.ts` içinde çözümlenir; `breaking` (son dakika)
bayrağı yalnızca editörün tetiklediği `pushStory` ile konur, senkron dokunmaz.

Aynı şekilde fuar takvimi (`src/data/events.ts`) ve kaynak kataloğu
(`agent/sources.json`, `agent/source-catalog.json`) sitedeki dosyalardan bu
uygulamanın Convex tablolarına aktarılır:

```bash
npx convex run fairs:reseed      # fuar takvimini sitedeki dosyadan yeniden yükle
npx convex run sources:reseed    # kaynak kayıtlarını yeniden yükle
```

Yeni bir dağıtımda bu iki tablo boştur. `src/convex/seed.ts` içindeki
`ensureSeeded` mutation'ı **yalnızca boş** tabloları doldurur ve 15 dakikalık bir
cron ile çalışır; yani elle çalıştırmayı unutsan da takvim ve kaynak dizini en
geç 15 dakika içinde kendiliğinden dolar. Yukarıdaki komutlar asıl olarak
**içeriği tazelemek** içindir (haber odasının dosyaları değiştiğinde).
Haberler bundan bağımsızdır: 30 dakikalık senkron `makinenabzi.com/feed.json`
adresinden kendiliğinden çeker.

## Yerel geliştirme

```bash
bun install
npx convex dev      # ilk çalıştırmada proje oluşturur, src/convex/_generated yazar
bun run dev         # http://localhost:5173
```

`bun run build` = `tsc -b && vite build`. Tip denetimi tek başına: `bun run build`
çalıştırmadan `bunx tsc -b --noEmit`.

## Ortam değişkenleri

| Değişken | Nerede | Ne için |
| --- | --- | --- |
| `VITE_CONVEX_URL` | Vercel (build) veya `.env.local` | Uygulamanın Convex adresi |
| `CONVEX_DEPLOY_KEY` | Vercel (build) | `convex deploy`'u CI'dan çalıştırmak için |
| `JWKS`, `JWT_PRIVATE_KEY`, `SITE_URL` | Convex deployment | Convex Auth anahtarları |
| `RESEND_API_KEY` | Convex deployment | Giriş kodu e-postası (aşağıya bakın) |
| `NEWS_FEED_JSON_URL` | Convex deployment | Yalnızca geçici yönlendirme |

`VITE_CONVEX_URL` tanımlı değilse uygulama beyaz ekran yerine okunur bir
"yapılandırma eksik" mesajı gösterir.

Örnek bir `.env` dosyası pakete dahil edilmez; değerler Vercel ve Convex
panellerinden girilir.

## Giriş kodu e-postası

`src/convex/auth/emailOtp.ts`, `RESEND_API_KEY` tanımlıysa kodu **kendi Resend
hesabınızdan** gönderir; tanımlı değilse eski (yalnızca çalışma ortamında geçerli
olan) yola düşer. Yayında mutlaka `RESEND_API_KEY` ayarlayın ve gönderen alan
adını Resend'de doğrulayın. Gönderen adresini `AUTH_EMAIL_FROM` ile
değiştirebilirsiniz.

## Yayın

Vercel'de ayrı bir proje olarak yayınlanır (root dizini `app`) ve
`app.makinenabzi.com` alan adına bağlanır. Vercel build komutu, Convex
tiplerini üretmek için `convex deploy`'u da çalıştırmalıdır — ayrıntı için
depo kökündeki `MIGRATION.md`, Adım 5.

Bu klasördeki `vercel.json`, uzantısız tüm yolları `index.html`'e yönlendirir.
Olmadan `/auth` ve `/dashboard` adresleri tarayıcı yenilemesinde 404 verir;
statik dosyalar (`/assets/...`, `/brand-mark.svg`, `/manifest.webmanifest`)
etkilenmez. Vercel'de **Root Directory** `app` seçilmelidir, aksi hâlde Vercel
bu dosyayı hiç okumaz.
