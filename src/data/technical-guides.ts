export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface TechnicalGuide {
  slug: string;
  title: string;
  system: string;
  systemNo: string;
  dek: string;
  updated: string;
  sections: GuideSection[];
  note?: string;
}

export const guides: TechnicalGuide[] = [
  {
    slug: 'can-j1939-mobil-makine-haberlesmesi',
    title: 'CAN ve J1939 ile mobil makine haberleşmesi: mimari, mesaj yapısı ve saha gerçekleri',
    system: 'Elektronik & Telematik',
    systemNo: '04',
    dek: 'Bir iş makinesinde ECU\'lar arasındaki veri yolu nasıl çalışır? CAN fiziksel katmanından J1939 PGN\'lerine, sahte sinyal gürültüsünden telemetri entegrasyonuna kadar pratik bir teknik çerçeve.',
    updated: '2026-10-13',
    sections: [
      {
        heading: 'Neden tek bir veri yolu?',
        paragraphs: [
          'Modern bir mobil makinede motor kontrol ünitesi (ECU), şanzıman kontrolü, hidrolik valf kontrolörü, gösterge paneli, telemetri ünitesi ve giderek artan sayıda sensör paketi bulunur. Bu bileşenlerin her biri kablo demeti üzerinden ayrı sinyal hatlarıyla bağlanırsa hem kablo ağırlığı hem arıza noktası sayısı patlar. CAN (Controller Area Network), bunun yerine ortak bir veri yolu üzerinde yayın-tabanlı (broadcast) haberleşme sunar: her düğüm (node) ortak hattı dinler, kendi mesajını yayınlar ve ilgilendiği mesajları okur.',
          'Fiziksel katmanda tipik uygulama 250 kbit/s veya 500 kbit/s hızlarda çalışan çift bükümlü, 120 Ω sonlandırılmış bir hat çiftidir (CAN_H / CAN_L). Makine kablolarında titreşim, motor kaynaklı gürültü ve uzun hat boyları nedeniyle büküm oranı, ekranlama (shielding) ve topraklama düzeni kritiktir; sahada karşılaşılan "ara sıra kaybolan sinyal" vakalarının önemli kısmı fiziksel katman sorunlarına dayanır.'
        ],
        bullets: [
          'Bit hızı: mobil makinede yaygın olarak 250 kbit/s (J1939) veya 500 kbit/s',
          'Sonlandırma: hattın her iki ucunda 120 Ω direnç; yanlış sonlandırma en sık rastlanan kurulum hatası',
          'Mesaj uzunluğu: klasik CAN 8 bayt; CAN FD 64 bayta kadar (yeni nesil ECU\'larda yaygınlaşıyor)'
        ]
      },
      {
        heading: 'J1939 neyi standartlaştırır?',
        paragraphs: [
          'CAN yalnızca çerçeve (frame) formatını tanımlar; "61. baytın ne anlama geldiğini" söylemez. J1939, SAE tarafından özellikle ağır vasıta ve off-highway makineler için tanımlanmış bir üst katman protokolüdür. Haberleşmeyi Parametre Grup Numaraları (PGN) üzerinden düzenler: her PGN, belirli bir veri kümesini (örneğin motor yükü ve devir, şanzıman durumu, soğutma suyu sıcaklığı) tanımlar.',
          'Bir J1939 mesajının kimliği 29 bitlik uzun kimlik alanına gömülüdür: öncelik (3 bit), PGN ve kaynak adres (SA). Kaynak adres, veri yolundaki her düğüme benzersiz bir adres atar; bir ECU\'nun ağa katılması (address claiming) sırasında çakışma yönetimi de protokolün parçasıdır. Sinyal düzeyinde ise her PGN içindeki alanlar için ölçek (scale), ofset, çözünürlük ve geçerlilik (SPN — Suspect Parameter Number) tanımları bulunur. Örneğin motor devri 0,125 rpm/bit çözünürlükte kodlanır; ham değeri 0,125 ile çarpmadan anlamlandırmak imkânsızdır.',
          'Telemetri tarafı için önemli sonuç: markadan bağımsız bir telemetri ünitesi veya HMI, J1939\'u dinleyerek motor ve şanzıman verisini okuyabilir. Ancak "J1939 okuyabilirim" demek her şeyi okuyabilirim anlamına gelmez; OEM\'ler üreticiye özgü PGN\'ler ve hatta J1939\'u kendi özel mesajlarıyla genişletir. Bu yüzden sahada veri sözlüğü (PGN/SPN listesi) olmadan yapılan entegrasyonlar yarım kalır.'
        ]
      },
      {
        heading: 'Saha gerçekleri: gürültü, kayıp mesaj ve teşhis',
        paragraphs: [
          'CAN\'ın CRC ve otomatik yeniden iletim mekanizmaları sağlamdır ama kusursuz değildir. Hattın yanlış sonlandırılması, ekranlamanın tek noktadan topraklanmaması veya alternatör/güç elektroniği kaynaklı akım darbeleri, hata sayacının yükselmesine ve sonuçta düğümün "error passive" durumuna düşmesine yol açar. Belirti genellikle "makine ısınınca haberleşme kesiliyor" veya "yalnızca belirli ekipman çalışırken veri kayboluyor" şeklindedir.',
          'Teşhis sırasında akıllı çalışma sırası şudur: önce hat direnci ve gerilim seviyeleri (CAN_H − CAN_L farkı), sonra hata sayacı ve mesaj kayıp oranı, en sonunda uygulama katmanı (PGN doğruluğu). Çok sık yapılan hata, doğrudan yazılım katmanına odaklanıp fiziksel katmanı atlamaktır. Telemetri entegrasyonlarında ayrıca "ham veri ile gösterilen veri" ayrımı yapılmalıdır: ölçek/offset hatası, yanlış SPN eşlemesi gibi uygulama katmanı hataları, veriyi sessizce yanlış gösterir — en pahalı arıza tipi budur.'
        ],
        bullets: [
          'Ölçüm: hat direnci (güç kapalı, iki uç arasında ~60 Ω), boşta gerilim seviyeleri',
          'İzleme: hata aktif/passive durumları, TX/RX hata sayaçları, mesaj periyot sapmaları',
          'Doğrulama: bilinen bir PGN\'yi (ör. motor devri) referans cihazla karşılaştırma'
        ]
      }
    ],
    note: 'Bu dosya bilgilendirme amaçlıdır; spesifik bir makine için teşhis ve modifikasyon kararları OEM dokümantasyonu ve yetkili servis prosedürlerine dayanmalıdır.'
  },
  {
    slug: 'hidrolik-sistem-verimliligi-enerji-kayiplari',
    title: 'Hidrolik sistem verimliliği: kayıplar nerede oluşur, ısıya dönüşen enerji nasıl azaltılır?',
    system: 'Hidrolik Sistemler',
    systemNo: '03',
    dek: 'Pompa verimi, valf kayıpları, hat dirençleri ve soğutucu yükü: mobil makine hidroliğinde enerjinin nereye gittiğini sistem seviyesinde anlamak.',
    updated: '2026-10-13',
    sections: [
      {
        heading: 'Verim bir sayı değil, üç ayrı kayıptır',
        paragraphs: [
          'Bir hidrolik pompanın verimi genellikle tek bir yüzde olarak konuşulur; oysa üç ayrı bileşenden oluşur: hacimsel verim (iç sızıntılar), mekanik/tribolojik verim (sürtünme) ve hidrolik verim (basınç-düşüm kayıpları). Düşük devirde çalışan bir aksiyel piston pompada hacimsel sızıntı oranı artar; yüksek basınçta mekanik kayıplar büyür. Sistem verimi ise pompanın yanı sıra valfler, hortumlar, borular ve aktüatörün verimini de kapsar.',
          'Pratik sonuç: katalogdaki "%92 pompa verimi" bilgisi, makinenin toplam hidrolik verimini söylemez. Bir yükleyicide hidrolik gücün önemli bir kısmı, kontrol valflerindeki basınç düşümlerine ve oransal valflerdeki kısma (throttling) kaybolarak ısıya dönüşür. Bu yüzden hidrolik yağ sıcaklığı, sistemin gizli verim ölçütüdür: soğutucu üzerindeki sıcaklık farkı artıyorsa, sisteminiz enerjiyi ısıya çeviriyor demektir.'
        ]
      },
      {
        heading: 'Enerji haritanızı çıkarın: giriş, çıkış, kayıp',
        paragraphs: [
          'Sistem seviyesinde verimlilik çalışması, üç noktada ölçümle başlar: pompa milinden giren mekanik güç (tork × devir), aktüatördeki faydalı çıkış (kuvvet × hız veya tork × devir) ve soğutucuya atılan ısı. Aradaki fark, kayıptır. Saha koşullarında tam ölçüm her zaman mümkün olmasa da motor yakıt tüketimi ile hidrolik çevrim süresi arasındaki ilişki, verimlilik trendini izlemek için iyi bir göstergedir.',
          'En sık rastlanan kayıp kalemleri: kısmi yükte çalışan sabit deplajlı pompaların taşma (bypass) üzerinden kontrol edilmesi, uzun ve dar hortum hatları, oransal valflerin düşük açılarda çalıştırılması ve bekleme (idle) sırasında devrede tutulan basınç. Değişken deplajlı pompa + yük duyarlı kontrol (load sensing) veya elektrikli oransal kontrol mimarileri bu kayıpları belirgin biçimde azaltır; elektrifikasyonla birlikte e-pompa ve değişken hızlı tahrik (pompa devrinin talebe göre ayarlanması) giderek yaygınlaşıyor.'
        ],
        bullets: [
          'Hacimsel kayıp → sızıntı, yağ ısınması, düşük devirde tepki kaybı',
          'Kısma kaybı → valf üzerindeki basınç düşümü, doğrudan ısı üretimi',
          'Hat kaybı → hortum uzunluğu/çapı, bükülme yarıçapları, bağlantı sayısı',
          'Bekleme kaybı → çevrim dışıyken devrede kalan basınç ve pompa sürtünmesi'
        ]
      },
      {
        heading: 'Sıcaklık ve yağ: verimliliğin gizli tarafı',
        paragraphs: [
          'Hidrolik yağın viskozitesi sıcaklıkla değişir; soğuk çalıştırma sırasında yüksek viskozite hat kayıplarını artırırken, aşırı ısınan yağ sızıntıları büyütür ve hacimsel verimi düşürür. Her iki uç da verimsizliktir. Bu yüzden soğutucu boyutlandırma, yalnızca "yağ ısınmasın" diye değil, optimal viskozite bandını korumak için yapılır.',
          'Kestirimci bakım açısından da sıcaklık verisi değerlidir: aynı çevrimde soğutucu giriş-çıkış sıcaklık farkının zamanla artması, valf aşınması veya pompa sızıntısının habercisi olabilir. Yağ analizi (partikül sayımı, su içeriği, oksidasyon) ile birlikte okunduğunda, hidrolik sistemlerde verim düşüşü çoğu zaman arızadan önce tespit edilebilir.'
        ]
      }
    ],
    note: 'Ölçüm ve ayar işlemleri hidrolik basınç altındaki sistemlerde ciddi risk taşır; yetkili servis prosedürlerine ve basınç tahliye adımlarına uyulmalıdır.'
  },
  {
    slug: 'mobil-makine-batarya-bms-mimari-temelleri',
    title: 'Mobil makinelerde batarya ve BMS mimarileri: hücreden HV sisteme temel karar noktaları',
    system: 'Elektrifikasyon & Elektrikli Tahrik',
    systemNo: '02',
    dek: 'Elektrikli bir iş makinesinde batarya paketi nasıl boyutlandırılır? Hücre kimyası, seri/paralel mimari, SOC/SOH tahmini, termal yönetim ve HV güvenlik katmanlarının sistem mimarisindeki yeri.',
    updated: '2026-10-13',
    sections: [
      {
        heading: 'Makine talebiyle başlayın: güç mü, enerji mi?',
        paragraphs: [
          'Batarya boyutlandırmanın ilk adımı teknoloji seçimi değil, iş çevrimi analizidir. Bir ekskavatörde kısa süreli yüksek güç darbeleri (kaldırma, kırım) mi yoksa sürekli orta yük (sevkiyat kamyonu, konveyör) mi olduğu, mimariyi temelden belirler. Güç yoğunluğu gereksinimleri LFP yerine NMC/NCA gibi kimyalara veya hibrit kapasitör çözümlerine yönlendirebilir; enerji yoğunluğu ve döngü ömrü öncelikliyse LFP avantajlıdır.',
          'İkinci adım çevrim profili: günlük kWh tüketimi, pik güç (kW), rejeneratif frenlemeyle geri kazanılan enerji ve şarj stratejisi (mola şarjı mı, gece şarjı mı). "Batarya = makinenin yakıt deposu" benzetmesi yanıltıcıdır; batarya aynı zamanda güç kaynağı ve termal bir yüküdür. kWh cinsinden depolama kapasitesi ile kW cinsinden deşarj kabiliyeti birlikte değerlendirilmezse, sahada ya performans ya da çalışma süresi hedefi tutmaz.'
        ],
        bullets: [
          'Pik güç gereksinimi → inverter ve hücre C-rate seçimi',
          'Günlük enerji → paket kapasitesi ve şarj altyapısı',
          'Döngü derinliği ve ortam sıcaklığı → kimya ve termal yönetim tercihi'
        ]
      },
      {
        heading: 'Seri/paralel mimari ve BMS katmanları',
        paragraphs: [
          'Hücreler seri bağlanarak voltaj, paralel bağlanarak kapasite artışı sağlar. Makine voltaj seviyesi (örneğin 48 V, 400 V, 800 V) hem güvenlik mesafelerini hem de kablo kesitlerini belirler: yüksek voltaj, aynı güçte daha düşük akım ve dolayısıyla daha ince kablo anlamına gelir; ancak yalıtım, ark riski ve servis güvenliği gereksinimleri artar. Mobil makinelerde 400 V sınıfı yaygınlaşırken, yüksek güçlü maden kamyonları 800 V mimarilere yöneliyor.',
          'Batarya Yönetim Sistemi (BMS) üç temel görevi yürütür: hücre dengeleme (balancing), durum tahmini (SOC/SOH) ve koruma (aşırı akım, aşırı voltaj, düşük voltaj, sıcaklık limitleri). Pasif dengeleme fazla enerjiyi direnç üzerinden yakar ve yalnızca şarj sonunda etkilidir; aktif dengeleme enerjiyi hücreler arasında taşır ama maliyet ve karmaşıklık katar. SOC tahmini (voltaj tabanlı, amper-sayım, model tabanlı) sahada "gösterge ile gerçek menafe" farkının en sık yaşandığı alandır; SOH tahmini ise garanti ve ikinci hayat (second-life) kararları için kritiktir.'
        ]
      },
      {
        heading: 'Termal yönetim ve HV güvenlik mimarisi',
        paragraphs: [
          'Mobil makine bataryaları titreşim, toz, su ve geniş sıcaklık aralıkları altında çalışır. Termal yönetim; sıvı soğutma/isıtma devreleri, PCM (faz değiştiren malzeme) veya hava soğutma seçenekleriyle hücrelerin optimal sıcaklık bandında (genellikle 15–35 °C) tutulmasını sağlar. Sıcaklık homojenliği, yalnızca performans değil ömür için de belirleyicidir: paket içindeki sıcaklık gradyanı arttıkça hücreler arasındaki yaşlanma farkı büyür ve paket kapasitesi en zayıf hücreyle sınırlanır.',
          'HV güvenlik tarafında katmanlı bir mimari beklenir: izolasyon izleme (IMD), yüksek voltaj bağlantısı (kontaktörler), çarpma/kaza durumunda otomatik kesme, servis kesici (service disconnect) ve kısa devre koruması (füz/busbar tasarımı). ISO 6469 (elektrikli araç güvenlik) ve ilgili makine direktifleri, yalıtım direnci, IP koruma seviyeleri ve kıvılcım/ark yönetimi için çerçeve sunar. Pratikte en kritik uygulama: servis sırasında enerjinin güvenli tahliyesi ve kilitlenme/etiketleme (LOTO) prosedürüdür.'
        ],
        bullets: [
          'Sıcaklık homojenliği → ömür ve kullanılabilir kapasite',
          'IMD + kontaktör + servis kesici → katmanlı HV güvenlik',
          'Titreşim/su/toz → IP sınıfı, mekanik sabitleme, konnektör seçimi'
        ]
      }
    ],
    note: 'Bu dosya genel mimari çerçevesi sunar; spesifik paket tasarımı ve güvenlik doğrulaması ilgili standartlar (ISO 6469, IEC 62660, makine direktifleri) ve yetkili mühendislik süreçleri gerektirir.'
  }
];
