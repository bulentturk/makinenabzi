# Makine Nabzı — Android (Play Store) Planı

Uygulama adı: **Makine Nabzı**
Paket: `com.makinenabzi.app`
Yöntem: Mevcut PWA (`app/`) + Capacitor Android sarmalama. Sıfırdan Kotlin yazımı yok.

## Logo
Kaynak: `app/public/brand-mark.svg` ve `app/public/app-icon-maskable.svg`
- Koyu lacivert zemin `#0b1722`, cyan nabız çizgisi `#68d5fb`, turuncu uç `#f5a524`
- Ekteki görseldeki ikonla birebir aynı.
- Play Store PNG ister, SVG yetmez. Üretim ikonları:
  `app/public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`
  Bunlar `npm run assets:generate` ile `resources/` klasöründeki 1024px kaynaktan üretilir.

## Önkoşul (kendi bilgisayarında)
- Node 20 + npm, Android Studio + SDK 34, Java 17
- `app/` içinde:
```bash
npm install
npm run build
npm run assets:generate
npm run android:init     # ilk kez: android/ klasörünü üretir
npm run android:build    # build + cap sync
npm run android:open     # Android Studio açar
```
- Android Studio'da `android/` projesini aç, JDK 17 seç, Gradle sync yap.

## İmzalama + Play Console
1. Android Studio > Build > Generate Signed Bundle / APK > Android App Bundle
2. Yeni keystore oluştur (yedeğini sakla), `release` build al.
3. Play Console > Yeni uygulama > Makine Nabzı > AAB yükle.
4. Veri güvenliği formu: e-posta OTP girişi + Convex backend URL'sini beyan et.
5. Kapalı test (20 tester) → üretim.

## Fazlar
- Faz 1 (şu an hazır): Haber/teknik blog/fuar/kaynak okuma, favoriler, web bildirim.
  Offline: Capacitor sonrası service worker eklenecek.
- Faz 2: FCM push (Firebase `google-services.json` → `android/app/`), ilan/firma rehberi için Convex tablo + rol.

## Not
Bu ortamda Node olmadığı için `android/` klasörü ve AAB burada üretilmedi.
Yukarıdaki komutlar çalışınca `android/` otomatik oluşur, repoya commitlenir.
