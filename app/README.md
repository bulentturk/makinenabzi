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
Yapılandırılmış akış, sonraki editoryal düzeltmeleri de taşır. Haber sitedeki
onaylı akıştan çıkarılırsa Convex kaydı silinmez; okur akışından, kaydedilenlerden
ve haber bağlantısından gizlenir. RSS yedeği bir haberi yayından çekmez.
Dosya biçimi `src/convex/siteFeed.ts` içinde çözümlenir; `breaking` (son dakika)
bayrağı yalnızca `admin` rolündeki editörün tetiklediği `pushStory` ile konur;
senkron bu bayrağa dokunmaz. Editör rolü veritabanındaki `users.role` alanından
atanır; okur uygulamasında rol verme işlemi yoktur.

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
| `RESEND_API_KEY`, `AUTH_EMAIL_FROM` | Convex deployment | Giriş kodu e-postası ve doğrulanmış gönderen adresi |
| `NEWS_FEED_JSON_URL` | Convex deployment | Yalnızca geçici yönlendirme |

`VITE_CONVEX_URL` tanımlı değilse uygulama beyaz ekran yerine okunur bir
"yapılandırma eksik" mesajı gösterir.

Örnek bir `.env` dosyası pakete dahil edilmez; değerler Vercel ve Convex
panellerinden girilir.

## Giriş kodu e-postası

`src/convex/auth/emailOtp.ts`, kodu yalnızca **kendi Resend hesabınızdan**
gönderir. E-posta ile giriş için `RESEND_API_KEY` ve Resend'de doğrulanmış
`AUTH_EMAIL_FROM` zorunludur. Bu değerler yoksa misafir girişi çalışabilir,
ancak e-posta kodu gönderilemez. Eski üçüncü taraf e-posta/JWT sağlayıcıları
kullanılmaz.

## Yayın

Vercel'de ayrı bir proje olarak yayınlanır (root dizini `app`) ve
`app.makinenabzi.com` alan adına bağlanır. Vercel build komutu, Convex
tiplerini üretmek için `convex deploy`'u da çalıştırmalıdır. Üretim dağıtımını
geliştirme ortamı `loyal-warbler-290` yerine ayrı üretim ortamına bağlayın.
Üretim Convex ortamına `SITE_URL`, Convex Auth anahtarları ve doğrulanmış e-posta
göndericisi ayarlanmadan giriş akışı yayına alınmamalıdır.
`NEWS_FEED_JSON_URL` test yönlendirmesi üretimde boş kalmalıdır. Dağıtımdan
sonra Functions bölümünde cron görevlerini ve ilk senkronun `siteSync`
durumunu doğrulayın; üretim tablosu geliştirmedeki kayıtlardan bağımsız olarak
ilk çalışmada doldurulur.

Bu klasördeki `vercel.json`, uzantısız tüm yolları `index.html`'e yönlendirir.
Olmadan `/auth` ve `/dashboard` adresleri tarayıcı yenilemesinde 404 verir;
statik dosyalar (`/assets/...`, `/brand-mark.svg`, `/manifest.webmanifest`)
etkilenmez. Vercel'de **Root Directory** `app` seçilmelidir, aksi hâlde Vercel
bu dosyayı hiç okumaz.
