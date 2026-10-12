export interface ArticleEnrichment {
  slug: string;
  headline: string;
  paragraphs: string[];
  relatedGuides?: string[];
  relatedFormats?: string[];
}

export const enrichments: ArticleEnrichment[] = [
  {
    slug: 'perkins-5016-dizel-motoru-5000-serisini-tamamladi',
    headline: 'Teknik bağlam',
    paragraphs: [
      'Perkins\'in basına yansıyan teknik ayrıntıları, 5016\'nın mobil makine motoru değil, güç üretimi (jeneratör) odaklı bir motor olduğunu netleştiriyor: 61 litre hacimli V16 mimari, 50 Hz\'de 1400–2500 kVA aralığında sürekli/prime ve yedek güç uygulamaları için tasarlanmış. 5000 serisi böylece 5006 (6 silindir), 5008 (8 silindir) ve 5012\'den (12 silindir) sonra 5016 ile tamamlanıyor.',
      'Dikkat çeken mühendislik tercihi, her silindir bankasında ikişer küçük turboşarj kullanılması: tek büyük turbo yerine bu mimari, geçiş (transient) tepki süresini kısaltarak yük kabul (load acceptance) performansını artırıyor — ISO G3 ve NFPA 110 gibi jeneratör seti standartlarının aradığı kriterler. Egzoz manifoldları da turboşarjlara gaz akışını optimize edecek şekilde tasarlanmış.',
      'Yakıt sistemi tarafında 5000 serisine özel düşük basınçlı besleme kullanılıyor; bu sistem yakıt kalitesindeki değişime tolerans sağlıyor ve B20 biodiesel ile %100 HVO (hidrojenle işlenmiş bitkisel yağ) kullanımına izin veriyor. Tam yetkili elektronik enjeksiyon, zamanlama ve basıncı ortam sıcaklığı ile rakıma göre ayarlayabiliyor. 60 Hz konfigürasyon ABD EPA Tier 2 (Acil Durum Sabit) emisyon seviyesini karşılarken 50 Hz versiyonu yakıt-optimizeli olarak eşdeğer seviyede sunuluyor. Bakım aralığı 750 saat olarak açıklanmış.',
      'Makine Nabzı perspektifi: haberin mobil makine kategorisiyle doğrudan ilgisi sınırlı; ancak saha güç altyapısı için önemli. Uzak şantiyelerde elektrikli iş makinelerinin şarj altyapısı veya sürekli güç ihtiyacı, tam da bu sınıftaki jeneratör setleriyle karşılanıyor. Ayrıca küçük-çift turbo ile yük kabul stratejisi, mobil motorlarda geçiş tepkisini iyileştirme arayışındaki mühendislik için aktarılabilir bir örnek teşkil ediyor.'
    ],
    relatedGuides: ['mobil-makine-batarya-bms-mimari-temelleri'],
    relatedFormats: ['dizel-elektrikli-kompakt-ekskavator-karsilastirmasi']
  },
  {
    slug: 'dp-world-southampton-in-60-milyon-sterlinlik-vinc-yatirimi-tamamlandi',
    headline: 'Teknik bağlam',
    paragraphs: [
      'Programın tamamı, DP World Southampton konteyner terminaline toplam dört sahil vincinin (quay crane / STS) kazandırılmasını kapsıyor; son iki vincin teslimiyle 60 milyon sterlinlik yatırım tamamlanmış oldu. Limanın sahibi ve işletmecisi Associated British Ports (ABP), konteyner terminalini DP World işletiyor. Terminal yılda yaklaşık iki milyon konteyner elleçliyor.',
      'Yatırımın teknik itici gücü, gemi boyutlarının büyümesi: son yıllarda konteyner gemilerinin kapasite ve genişlik artışına paralel olarak sahil vinçlerinin erişim (outreach) yüksekliği ve kapasite sınıfı da büyüyor. Program boyunca liman, dünyanın en büyük konteyner, araç ve yolcu gemilerini ağırladı; bu gemileri karşılayabilmek vinç sınıfı ve terminal altyapısı için doğrudan bir gereklilik.',
      'Makine Nabzı perspektifi: sahil vinci yatırımları yalnızca kapasite değil, enerji ve kontrol mimarisi için de bir eşik. Modern STS vinçlerinde enerji geri kazanımı, değişken hızlı sürücüler ve sahil elektriği (shore power) entegrasyonu standartlaşıyor; elleçleme hızı ise vinç mekaniği kadar kumanda ve terminal otomasyon sistemlerine bağlı. Bu tür büyük yatırım programları, liman ekipmanı tedarik zinciri ve otomasyon teknolojileri için önemli referans noktalarıdır.'
    ],
    relatedGuides: ['hidrolik-sistem-verimliligi-enerji-kayiplari']
  },
  {
    slug: 'wacker-neuson-yeni-ekskavatorlerini-tanitti-ew135-seriye-katildi',
    headline: 'Teknik bağlam',
    paragraphs: [
      'Wacker Neuson\'un EW serisi, lastikli yürüyüş kullanan ekskavatör ailesini ifade eder; EW135 bu ailenin en yeni üyesi olarak ürün gamına katıldı ve lansman, iVT International\'ın aktardığı video üzerinden tanıtıldı. Üretici aynı zamanda mevcut ekskavatör modellerinde yeniden tasarımı da duyurdu.',
      'Lastikli ekskavatör ile paletli ekskavatör arasındaki temel ayrım yürüyüş mimarisidir: lastikli makineler asfalt ve sert zeminde kendi kendine hızlı transfer yapabilir, zeminde iz bırakmaz; paletli makineler ise yumuşak zeminde daha iyi çekiş ve stabilite sunar. Bu nedenle EW sınıfı özellikle belediye işleri, altyapı bakım, yol kenarı çalışmaları ve kentsel alanlarda tercih edilir.',
      'Sınıfın genel teknik eğilimleri lansmanları okurken arka planda tutulmalı: Stage V emisyon uyumu, yük duyarlı hidrolik sistemler, hassas joystick kumandaları, telemetri ile uzaktan izleme ve giderek artan elektrikli/hibrit seçenekler. EW135\'in teknik değerleri üretici katalogları açıklandığında netleşecek; video lansmanı bu aşamada ürün gamı konumlandırmasını gösteriyor.'
    ],
    relatedGuides: ['hidrolik-sistem-verimliligi-enerji-kayiplari', 'can-j1939-mobil-makine-haberlesmesi'],
    relatedFormats: ['paletli-ekskavator-sinifi-makine-dosyasi']
  }
];
