# Makine Nabzı Editoryal Onay Akışı

## Akış
1. News Agent güvenilir kaynaklardan aday haberleri toplar.
2. AI Editorial Draft seçilen adaylar için Türkçe taslak üretir.
3. Taslak `drafted` durumuna geçtiğinde Editorial Review PR workflow'u çalışır.
4. Aynı anda yalnız bir adet `Yayın Onayı` PR'ı açık tutulur.
5. PR **Merge** edilirse haber `src/data/published-news.json` içine girer ve siteye yayınlanır.
6. PR **Close** edilirse aday `rejected` olarak işaretlenir.
7. Merge veya rejection sonrasında sıradaki drafted aday otomatik olarak kuyruğa alınır.

## Onay
- Merge = yayınla
- Close = reddet
- PR yorumu = revizyon isteği

## Haber veri katmanı
Yayındaki haberler `src/data/published-news.json` dosyasında tutulur. Astro web sitesi aynı veri katmanından haber listeleme ve detay sayfalarını üretir. Bu yapı ileride mobil uygulama/API katmanına taşınabilir.

## AI kimlik doğrulama
Kişisel GitHub deposunda Copilot CLI otomasyonu için repository secret olarak `COPILOT_PAT` gerekir.

Fine-grained PAT:
- Resource owner: kişisel GitHub hesabı
- Account permission: Copilot Requests
- Repository access: yalnız `makinenabzi` yeterlidir

Secret yolu:
Repository → Settings → Secrets and variables → Actions → New repository secret

Name: `COPILOT_PAT`

Değer: oluşturulan fine-grained token.

Token hiçbir zaman repoya commit edilmez.
