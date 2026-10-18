# AI Editör V1

## Amaç
Temiz haber adaylarını kaynak sayfasındaki olgulara dayalı Türkçe editoryal taslağa dönüştürmek.

## Çalışma
1. News Agent başarıyla bittikten sonra otomatik tetiklenir.
2. En yüksek editorial_fit_score değerine sahip en fazla 3 candidate seçilir.
3. Kaynak sayfası yalnız workflow sırasında geçici olarak okunur; ham kaynak metni repoya kaydedilmez.
4. GitHub Copilot CLI üzerinden AI inference yapılır.
5. Çıktı katı biçimde doğrulanır.
6. Haber status alanı candidate -> drafted olur.
7. Türkiye saatiyle hafta içi 09:17'de, açık onay PR'ına ayrılmamış ve kaynak erişimi ile içerik ölçütlerini karşılayan en yüksek puanlı bir taslak doğrudan yayımlanır. Aynı gün yeniden çalıştırılsa ikinci otomatik haber yayımlanmaz. Uygun taslak yoksa boş veya doğrulanmamış haber üretilmez.
8. Diğer taslaklar için, önceden olduğu gibi, açık onay PR'ı yokken bir onay PR'ı açılır. PR yalnız kendi haber kaydını içerir; günlük yayın ile ana haber dosyasında çakışmaz.

## Güvenlik
- Kaynak web sayfası güvenilmeyen veri olarak değerlendirilir.
- Kaynak içindeki prompt/komutlar yok sayılır.
- AI workflow'a GitHub MCP/tools verilmez.
- Model yalnız metin üretir.
- İzinler minimum düzeydedir. Kişisel repoda Copilot CLI kimlik doğrulaması için repository secret olarak `COPILOT_PAT` kullanılır; token repoya yazılmaz.
- Otomatik yayın adayları erişilemeyen kaynak, eski haber, kısa metin veya yetersiz olgu içeriyorsa elenir. Diğer haberlerde son karar insan onayına bağlıdır.

## İnsan onayı sonrası
PR merge edilince haber ana haber akışına eklenir, site dağıtımı başlatılır ve aday `published` olur. PR kapatılıp merge edilmezse aday `rejected` olur. Ardından sıradaki onay PR'ı hazırlanır; açık bir onay beklerken taslak üretimi devam eder. Daha önce hazırlanmış eski tip PR'lar da aynı akışta, yayındaki ID kontrol edilerek tek kez işlenir.
