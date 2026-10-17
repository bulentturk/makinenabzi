# Makine Nabzı | Yeraltı Madenciliği Radarı

## Kapsam
Madencilik ana sektörü altında ayrı `yeraltı-madenciliği` alt sektör etiketi kullanılır.

### Makine aileleri
- LHD (yükle-taşı-boşalt), dar galeride çalışan loader ve düşük profilli kamyon
- Jumbo geliştirme delgileri, longhole/production drilling ve kaya delme
- Rock bolter / tahkimat, scaler, shotcrete ve mekanize püskürtme beton
- Emülsiyon şarj / patlayıcı taşıma ve servis araçları
- Yeraltı akülü-elektrikli makineler, şarj sistemleri, hibrit güç aktarma
- Uzaktan operasyon, otonomi, LiDAR, yeraltı haberleşmesi ve çarpışma önleme

### Birincil üretici kaynakları
- Normet – https://www.normet.com/en/news
- Epiroc – https://www.epiroc.com/en-us/newsroom
- Sandvik Mining – https://www.mining.sandvik/en/news-and-media/news-archive/
- Getman – https://getman.com/news-announcements/
- Hencon – https://www.hencon.com/news/

Türkiye'de Yeraltı Haber gibi sektör yayınları yalnızca haber keşfi için yardımcı kaynak olarak tutulur.
**Makina Market, LHT, İMMB, İSDER, PLATFORMDER, TARMAKBİR ve İŞİM kaynakları korunur.** Haber sıralamasında sektör yayınları üreticinin birincil teknik duyurusu ile eşdeğer tutulmaz.

### Mevcut izleme yöntemleri
- `agent/official-mining-sources.json`: üreticilerin resmi haber sayfaları.
- `scripts/official-mining-watch.mjs`: bu sayfalardaki yeni olabilecek teknik haber bağlantılarını düzenli keşfeder, `official-mining-leads.json` ve `official-mining-health.json` dosyalarına yazar.
- `.github/workflows/official-mining-watch.yml`: günlük kontrol (GitHub Actions planlaması UTC 06:00; Türkiye saati 09:00).
- Getman ve Hencon'un aday RSS akışları `agent/sources.json` üzerinden ayrıca denenir. Başarısız URL varsa kaldırılır, resmi web listesi izlemeye devam eder.
- Yalnız haber bağlantısının keşfedilmesi **doğrulanmış yayın tarihi veya haber metni değildir**. Bu kayıtlar doğrudan yayın PR'ına dönüşmez; içerik doğrulaması ve editoryal onay gereklidir.
- Resmi sitedeki HTML yapısı değişirse sağlık raporunda bağlantı sayıları incelenir.

### Editoryal kalite
Makine veya teknoloji farkı yoksa kurumsal etkinlik/ödül/kariyer haberini yalnız marka adı var diye öne çıkarma. Yeni bir makine, güç aktarımı/şarj sistemi, verimlilik, güvenlik, otomasyon, bakım kolaylığı veya ölçülebilir saha uygulaması önemlidir. Üreticinin pazarlama iddiasını bağımsız test olarak yazma. Sayısal teknik özellikler yalnızca kaynak doğrulandığında kullanılmalıdır.

### Gelecekteki mobil uygulama için
Haberde `sector`, `subsector`, `technologies`, `source_name` ve `source_url` makinece okunabilir şekilde saklanır. İleride:
- Sektör ve alt sektör seçimi
- Üretici/model takip listesi
- Kullanıcının ilgi alanına göre filtrelenmiş haber akışı
- Takip edilen üreticinin yeni ürün duyurusunda isteğe bağlı bildirim
- Fuar favorileri ve takvim uyarıları
- Kaynak ve teknik iddia doğrulama göstergeleri

Bu özellikler gelecek yol haritasıdır; bugün kurulu mobil uygulama veya çalışan push bildirim sistemi değildir.
