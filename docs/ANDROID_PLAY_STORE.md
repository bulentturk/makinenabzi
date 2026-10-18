# Makine Nabzı — Android (Play Store)

Uygulama adı: **Makine Nabzı**
Paket: `com.makinenabzi.app`
Yöntem: Mevcut PWA (`app/`) + Capacitor 6 Android sarmalama. Sıfırdan Kotlin yazımı yok.
Durum: `./gradlew assembleDebug` ile APK üretildi (doğrulandı).

## Kritik iki kural (yoksa Gradle derlemez)

1. **Proje yolu ASCII olmalı.** Windows'ta `C:\Users\Bülent TÜRK\...` gibi Türkçe
   harf içeren yollarda AGP `Your project path contains non-ASCII characters`
   hatası verir. Projeyi `C:\makinenabzi` gibi kısa ve harfsiz bir yola kopyala,
   Android Studio'da `C:\makinenabzi\app\android` klasörünü aç.
   (`git` deposu kökte kalır; Android Studio'ya repo kökünü değil, `app/android`
   klasörünü aç.)

2. **Gradle JDK 21 olmalı.** Wrapper `gradle-8.7` olarak güncellendi çünkü
   Gradle 8.2.1 Java 21+ ile çalışmıyordu (`Incompatible Gradle JVM`).
   Android Studio > `Settings > Build, Execution, Deployment > Build Tools > Gradle`
   > **Gradle JDK: jbr-21 (Android Studio'nun gömülü JDK'sı)**.
   Sistemdeki Java 25 seçilmemeli (Gradle 8.7 Java 25'i desteklemez).

## Logo ve ikonlar
Kaynak: `app/resources/icon.svg` (adaptive/maskable), `app/resources/splash-icon.svg`
Renkler: zemin `#0b1722`, nabız çizgisi `#68d5fb`, uç `#f5a524`.

```bash
cd app
npm run assets:generate
```

Bu komut 74 Android varlığı (mipmap + splash) üretir. `@capacitor/assets`
PWA manifestini de bozduğu için (bozuk `background_color`, `public` dışını
gösteren ikon yolları, silinen SVG'ler) script sonunda
`scripts/restore-pwa-manifest.mjs` çalışır ve manifest + SVG'leri geri yükler.
Renk bayrakları `--flag=#0b1722` biçiminde yazılmalı: tırnaklı yazım PowerShell'de
`Unable to parse color` hatası verip ikonları sessizce atlar.

## Derleme
```bash
cd app
npm install
npm run build            # dist/ üretir
npx cap sync android     # dist'i android/assets'e kopyalar
cd android
./gradlew assembleDebug  # APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Android Studio ile: `app/android` klasörünü aç → Gradle sync → `Run` (emülatör/cihaz).

## İmzalı AAB (Play Store)
1. Android Studio > `Build > Generate Signed Bundle / APK > Android App Bundle`
2. `Create new...` ile keystore oluştur — dosyayı ve şifreleri **yedekle**,
   kaybedersen uygulamayı bir daha güncelleyemezsin.
3. `release` varyantını seç, `Create`.
4. Çıktı: `android/app/release/app-release.aab`

`local.properties` (`sdk.dir`) makineye özeldir, `.gitignore`'da; repoya girmez.

## Play Console
1. play.google.com/console > Yeni uygulama > Makine Nabzı (varsayılan dil: Türkçe)
2. `Üretim > Yeni sürüm` > AAB yükle
3. Veri güvenliği: e-posta OTP girişi + Convex backend adresi beyan edilir
4. İçerik derecelendirme, hedef kitle, mağaza girişi (ikon/kapak/görseller)
5. Önce kapalı test (20 tester) → üretime al

## Fazlar
- Faz 1 (hazır): haber/teknik blog/fuar/kaynak okuma, favoriler, web bildirim,
  ilan + firma rehberi + dergi backend'i (bkz. `docs/BACKEND_SETUP.md`).
- Faz 2: FCM push (`google-services.json` → `android/app/`), offline service worker,
  mağaza içi satın alma yok.
