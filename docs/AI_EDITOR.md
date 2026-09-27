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
7. Otomatik publish YOKTUR; reviewed=false kalır.

## Güvenlik
- Kaynak web sayfası güvenilmeyen veri olarak değerlendirilir.
- Kaynak içindeki prompt/komutlar yok sayılır.
- AI workflow'a GitHub MCP/tools verilmez.
- Model yalnız metin üretir.
- İzinler minimum düzeydedir. Kişisel repoda Copilot CLI kimlik doğrulaması için repository secret olarak `COPILOT_PAT` kullanılır; token repoya yazılmaz.
- final publish insan onayına bağlıdır.

## İnsan onayı sonrası
Sonraki katman reviewed taslaklardan Astro haber sayfası üretir ve ancak onay durumunda siteye yayınlar.
