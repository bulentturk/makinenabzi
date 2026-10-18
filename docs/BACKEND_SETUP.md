# Makine Nabzı — Backend Kurulumu (Convex)

Mevcut PWA zaten Convex kullanıyor. Bu adım ilan + firma rehberi + dergi + native push tablolarını ekler.

## Yeni tablolar
- `companies` — firma rehberi (pending → approved akışı, `companies:list/getById/submit/approve`)
- `listings` — ilanlar (pending → approved, `listings:list/myListings/create/moderate/remove`)
- `magazines` — dergi sayıları / offline paket (`magazines:list/getById/createIssue`)
- `pushTokens` — Android FCM tokenları (`push:saveToken/myTokens/removeToken`)
- Mevcut: `articles`, `bookmarks`, `fairs`, `sources`, `notifications`, `notificationPrefs`, `siteSync`, `users`

## Kurulum (Node olan makinede, `app/` içinde)
```bash
npm install
npx convex dev        # ilk çalışta proje açar, _generated üretir
# yeni tablolar boş gelir; 15 dk cron otomatik doldurur:
# fairs + sources + companies (örnek 3 firma)
npx convex run fairs:reseed
npx convex run sources:reseed
```

## Gerekli env (Convex dashboard)
- `SITE_URL` — örn `https://app.makinenabzi.com`
- `JWKS`, `JWT_PRIVATE_KEY` — Convex Auth
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — Google ile giriş (aşağıdaki kurulum)
- `RESEND_API_KEY`, `AUTH_EMAIL_FROM` — e-posta OTP (Google açılınca zorunlu değil)
- `NEWS_FEED_JSON_URL` — sadece geçici test, üretimde boş

## Vercel (app yayını)
- Root Directory: `app`
- Build: `npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npm run build'`
- `VITE_CONVEX_URL` + `CONVEX_DEPLOY_KEY` tanımlı olmalı

## Editör rolü
`users.role = "admin"` olan kullanıcı:
- `news:pushStory` ile son dakika bildirimi atar
- `listings:moderate` + `companies:approve` ile ilan/firma onaylar
- `magazines:createIssue` ile dergi sayısı açar

## Android push geçişi
1. Firebase'de Android uygulaması (`com.makinenabzi.app`), `google-services.json` → `android/app/`
2. Uygulama açılışta `registerNativePush()` → token → `push:saveToken`
3. `news:pushStory` sonrası FCM gönderimi için Convex'de `pushTokens` okuyan bir action eklenir (2. faz).

## Google ile giriş (önerilen yol)

Kod tarafı hazır: `src/convex/auth.ts` içinde `Google` sağlayıcısı kayıtlı,
giriş ekranında "Google ile devam et" düğmesi var. Eksik olan tek şey OAuth
istemcisi.

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   üzerinde **OAuth client ID → Web application** oluştur.
2. **Authorized JavaScript origins** alanına ekle:
   - `https://app.makinenabzi.com`
   - `http://localhost:5175` (yerel geliştirme)
3. **Authorized redirect URIs** alanına Convex dağıtımının callback adresini ekle:
   - Geliştirme: `https://flexible-ibex-197.eu-west-1.convex.site/api/auth/callback/google`
   - Üretim: `https://<üretim-dağıtımı>.convex.site/api/auth/callback/google`
     (`npx convex env get CONVEX_SITE_URL` ile kesin adresi görürsün)
4. Client ID / secret değerlerini Convex'e yaz:
   ```bash
   cd app
   npx convex env set AUTH_GOOGLE_ID <client-id>
   npx convex env set AUTH_GOOGLE_SECRET <client-secret>
   ```
   Üretim dağıtımı için `npx convex env set --prod ...` kullan.
5. OAuth consent screen'i "External" + test kullanıcısı ekleyerek yayına almadan
   deneyebilirsin; yalnızca eklediğin hesaplar giriş yapabilir.

Doğrulama: giriş ekranında düğmeye basıldığında Google'a `client_id` ile
yönlendirme yapılmalı. Anahtarlar yoksa Google "invalid_client" hatası döner —
bu, sağlayıcının bağlı olduğunu ama istemcinin tanımlanmadığını gösterir.
