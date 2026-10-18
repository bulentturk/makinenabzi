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
- `RESEND_API_KEY`, `AUTH_EMAIL_FROM` — e-posta OTP (yoksa misafir giriş çalışır)
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
