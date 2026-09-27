# Makine Nabzı Haber Ajanı — V1

## Amaç
V1 yalnızca haber adayı toplar. Otomatik yayın yapmaz.

## Akış
1. Onaylı RSS kaynaklarını tarar.
2. Son 4 gündeki içerikleri alır.
3. URL + başlıktan benzersiz kimlik üretir.
4. Tekrarları eler.
5. Sektör ve teknoloji etiketlerini anahtar kelime kurallarıyla önerir.
6. Öncelik puanı hesaplar.
7. Sonuçları `agent/drafts/news-candidates.json` içine yazar.
8. GitHub Action değişiklik varsa otomatik commit eder.

## Çalışma zamanı
Türkiye saatiyle yaklaşık 08:00 ve 18:00.

## Yayın güvenliği
- V1 hiçbir haberi siteye yayınlamaz.
- Kaynak metni kopyalanmaz.
- Aday kayıtlarda kaynak URL korunur.
- Türkçe başlık, özet, SEO metni ve "neden önemli" alanları editoryal katmanda üretilecektir.
- AI katmanı sonraki sürümde eklenir ve insan onayı olmadan publish durumuna geçmez.

## Sonraki sürüm
V2: kaynak sayfasını okuyup özgün Türkçe taslak üretme, kaynak doğrulama, benzer haber kümelendirme ve editoryal inceleme ekranı.
