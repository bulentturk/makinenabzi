# Makine Nabzı — site incelemesi ve yol haritası (27 Eylül 2026)

## Mevcut durum

- Astro ile üretilen statik site; ana sayfa, haberler, üç haber detayı, teknik merkez, fuar takvimi, kaynaklar ve hakkımızda olmak üzere dokuz indekslenebilir adres.
- Haber ajanı günde iki kez aday topluyor. Ayrı taslak ve editoryal onay akışı var; otomatik yayın yerine insan onayı korunuyor.
- Ana sayfada sektör ve teknoloji taksonomisi net, fakat son haberler görünmüyor. Altı sektör kartının tamamı aynı genel haberler adresine gidiyor.
- Teknik merkez konu kartlarından oluşuyor; henüz yazı/dosya sayfası yok. Kaynaklar listesi yayıncı adlarından oluşuyor ve bağlantı/filtre içermiyor.
- Haberler sayfasında üç içerik var. Kartlarda kaynak tarihi gösterilirken siteye yayın tarihi görünmüyor; haber detayında yazar, güncelleme tarihi, ilgili içerikler ve konu yolları yok.
- Fuar takvimi tarım, marine ve GSE dahil geniş bir alanı kapsıyor. Bazı “resmi etkinlik sayfası” bağlantıları etkinliğin kendi adresi yerine başka bir organizasyonun genel adresine gidiyordu; bu değişiklikte üçü düzeltildi.
- Search Console'da `makinenabzi.com` alan adı mülkü mevcut ama DNS sahiplik doğrulaması bekliyor. Bu değişiklik `sitemap.xml` ve `robots.txt` üretimini ekler.

## Öncelikli işler

| Sıra | İş | Tamamlanma ölçütü |
| --- | --- | --- |
| 0 | Logo sistemi ve taranabilirlik | Üst/alt menüde yeni marka işareti, favicon; çalışan `robots.txt` ve her yayınlanan haber için otomatik güncellenen sitemap. |
| 1 | Search Console doğrulaması | GoDaddy DNS köküne Google TXT kaydı eklenir; alan adı mülkü doğrulanır; `sitemap.xml` gönderilir, Google'ın okuma sonucu kontrol edilir. |
| 2 | Yayıncı ana sayfası | Hero altında son haberler, önemli teknik dosya ve yaklaşan fuar görünür; bu alanlar gerçek içerik verisinden beslenir. |
| 3 | Haber deneyimi | Site yayın tarihi ve kaynak tarihi açıkça ayrılır; ilgili haberler, kaynak bağlantısı, editoryal imza/kurallar ve paylaşım görseli eklenir. Özgün analiz ile kaynak olguları ayrı tutulur. |
| 4 | Gerçek sektör ve teknoloji sayfaları | Kartlar kendi kalıcı adreslerine bağlanır; filtreler çalışır; boş kategoride yanıltıcı “içerikleri gör” çağrısı gösterilmez. |
| 5 | Teknik merkez | İlk özgün teknik rehberler (ör. güç aktarma, hidrolik, CAN/J1939) yayımlanır; teknik içerikte tarih, kaynak ve sınırlar görünür. |
| 6 | Fuar takvimi kalitesi | Her etkinlik için doğrudan resmi bağlantı, son kontrol tarihi, kesin/tahmini tarih durumu ve değişiklik takibi tutulur; sektör/ülke/yıl filtreleri ve takvime ekleme gelir. |
| 7 | Keşif ve ölçüm | Haber/teknik içerik için uygun yapılandırılmış veri, OG görseli, RSS, Search Console kapsam/arama sorguları ve mobil performans izlenir. |
| 8 | Mobil uygulama hazırlığı | Web ve uygulama için ortak sürümlü içerik şeması/API, kalıcı kimlikler, görsel hakları, favori ve bildirim tercihleri tasarlanır; uygulama ekranları bu veriyle prototiplenir. |

## Editoryal ritim

Günde iki aday taraması yayın vaadi değildir. Aday → taslak → kaynak kontrolü → editoryal onay → yayın akışı korunur. Başlangıç hedefi günlük seçilmiş haberler, haftalık özgün teknik dosya, aylık pazar/veri incelemesi ve sürekli güncellenen fuar takvimidir. Sayıdan önce kaynak güvenilirliği, teknik doğruluk ve ölçülebilir özgün katkı gelir.

## İzlenecek göstergeler

- Search Console: doğrulanmış mülk, okunmuş sitemap, indekslenen adresler, ilgili arama sorgularında gösterim/tıklama/CTR.
- Yayın: son yedi günde yayımlanan özgün içerik, ilk kaynakla gecikme, düzeltme gerektiren haber sayısı ve kaynak kapsama alanı.
- Ürün: ana sayfadan haber/teknik dosyaya geçiş, fuar filtre kullanımı ve mobil gezinme başarısı.

Bu dokümandaki mevcut durum inceleme tarihine aittir; Search Console performans verisi ancak mülk doğrulandıktan sonra değerlendirilebilir.
