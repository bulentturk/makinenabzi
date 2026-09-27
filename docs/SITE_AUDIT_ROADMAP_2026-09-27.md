# Makine Nabzı — site incelemesi ve yol haritası (27 Eylül 2026)

## Mevcut durum

- Astro ile üretilen statik site; ana sayfa, haberler, dört haber detayı, teknik merkez, fuar takvimi, kaynaklar ve hakkımızda olmak üzere on indekslenebilir adres.
- Haber ajanı günde iki kez aday topluyor. Ayrı taslak ve editoryal onay akışı var; otomatik yayın yerine insan onayı korunuyor. Ajan sekiz RSS kaynağını tarayacak şekilde genişletildi; iVT International, Charged EVs ve Teknikport eklendi. Power & Motion ile OEM Off-Highway için doğrulanmış otomatik akış halen araştırılmalı.
- Ana sayfada son üç onaylı haber ve yaklaşan iki fuar gerçek yayın verisinden gösteriliyor. Altı sektör kartının tamamı halen aynı genel haberler adresine gidiyor.
- Teknik merkez konu kartlarından oluşuyor; henüz yazı/dosya sayfası yok. Kaynaklar listesi yayıncı adlarından oluşuyor ve bağlantı/filtre içermiyor.
- Haberler sayfasında dört içerik var. Kartlarda site yayın tarihi, haber detayında site/kaynak tarihi ve varsa güncelleme notu gösteriliyor. Yazar, ilgili içerikler ve konu yolları halen eksik.
- Fuar takvimi tarım, marine ve GSE dahil geniş bir alanı kapsıyor. Bazı “resmi etkinlik sayfası” bağlantıları etkinliğin kendi adresi yerine başka bir organizasyonun genel adresine gidiyordu; bu değişiklikte üçü düzeltildi.
- Search Console'da `makinenabzi.com` alan adı doğrulandı. `sitemap.xml` başarıyla gönderildi; 27 Eylül 2026'da dokuz adres keşfedildi. Keşif, dizine alındığı anlamına gelmez.
- Onaylı haberlere özel `/rss.xml` akışı eklendi. Adaylar ve taslaklar bu akışta bulunmaz.

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
| 7 | Kaynak kapsama alanı | Üç yeni RSS kaynağının gerçek çalışması GitHub Actions sağlık çıktısında izlenir. Power & Motion ve OEM Off-Highway için uygun izleme yöntemi doğrulanır; aynı iddianın birincil kaynakta doğrulanması yayın öncesi kontrolde yer alır. |
| 8 | Keşif ve ölçüm | Haber/teknik içerik için uygun yapılandırılmış veri, OG görseli, RSS, Search Console kapsam/arama sorguları ve mobil performans izlenir. |
| 9 | Mobil uygulama hazırlığı | Web ve uygulama için ortak sürümlü içerik şeması/API, kalıcı kimlikler, görsel hakları, favori ve bildirim tercihleri tasarlanır; uygulama ekranları bu veriyle prototiplenir. |

## Editoryal ritim

Günde iki aday taraması yayın vaadi değildir. Aday → taslak → kaynak kontrolü → editoryal onay → yayın akışı korunur. Başlangıç hedefi günlük seçilmiş haberler, haftalık özgün teknik dosya, aylık pazar/veri incelemesi ve sürekli güncellenen fuar takvimidir. Sayıdan önce kaynak güvenilirliği, teknik doğruluk ve ölçülebilir özgün katkı gelir.

## İzlenecek göstergeler

- Search Console: doğrulanmış mülk, okunmuş sitemap, indekslenen adresler, ilgili arama sorgularında gösterim/tıklama/CTR.
- Yayın: son yedi günde yayımlanan özgün içerik, ilk kaynakla gecikme, düzeltme gerektiren haber sayısı ve kaynak kapsama alanı.
- Ürün: ana sayfadan haber/teknik dosyaya geçiş, fuar filtre kullanımı ve mobil gezinme başarısı.

Bu dokümandaki mevcut durum inceleme tarihine aittir; Search Console performans verileri işlendikçe gösterim, tıklama ve indeks durumu ayrıca değerlendirilecektir.

## Yayın disiplini

- Haber adayları ve AI taslakları siteyi değiştirmez. Açık yayın onayı PR'ı varken sıradaki haber ayrıca yayımlanmaz. Merge yayınlar, Close reddeder, yorum revizyon içindir.
- Yayın onayı gecikirse taslak korunur. Genel EV haberleri için mobil makine bağlamı aranır; Türkçe makine ve komponent terimleri aday sınıflandırmasına dahil edilir.
- Kaynak hatası raporlanır; tüm RSS kaynakları aynı anda başarısız olursa ajan çalışması başarısız görünür. Kısmi kaynak hataları haber yayınlamaz, sağlık kaydında incelenir.
- Yeni kaynakların erişilebilirliği ve aday kalitesi canlı GitHub Actions çalışmasından sonra gözden geçirilir. Otomatik aday artışı günlük yayın sözü değildir.
