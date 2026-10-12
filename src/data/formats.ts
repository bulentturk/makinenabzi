export interface FormatSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface FormatPiece {
  slug: string;
  format: string;
  title: string;
  dek: string;
  updated: string;
  intro: string[];
  sections: FormatSection[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  note?: string;
  relatedGuides?: string[];
}

export const formatPieces: FormatPiece[] = [
  {
    slug: 'paletli-ekskavator-sinifi-makine-dosyasi',
    format: 'Makine Dosyası',
    title: 'Paletli ekskavatör sınıfı: anatomisi, sınıf sınırları ve seçim kriterleri',
    dek: 'Ekskavatör seçiminde "tonaj" bir başlangıç noktasıdır; asıl belirleyici olan yürüyüş mimarisi, hidrolik devre yapısı ve uygulama çevrimidir. Paletli ekskavatör sınıfını sistem seviyesinde ele alan bir makine dosyası.',
    updated: '2026-10-13',
    intro: [
      'Paletli ekskavatör; kazma, yükleme, kırım ve hafriyat çevrimlerinin merkezindeki makine sınıfıdır. Makineyi yalnızca marka-model ve tonaj üzerinden okumak, sahada yaşanan hayal kırıklıklarının başlıca kaynağıdır; çünkü aynı tonajda iki makine, farklı hidrolik mimari ve yürüyüş geometrileri nedeniyle tamamen farklı iş yapabilir.'
    ],
    sections: [
      {
        heading: 'Sınıfın anatomisi: dört alt sistem',
        paragraphs: [
          'Bir paletli ekskavatör dört ana bloktan oluşur: yürüyüş grubu (alt takım), döner platform (ev), iş ekipmanı (boom, arm, kova) ve güç-hidrolik paketi. Yürüyüş grubu; palet çerçevesi, tahrik motorları, planet redüktörlü final drive, makaralar ve palet zincirinden oluşur ve makinenin zemin basıncını belirler.',
          'Güç paketi dizel motor ve doğrudan kavramalı hidrolik pompalardan oluşur. İş ekipmanındaki her hareket, valf blokları üzerinden oransal olarak kontrol edilen hidrolik motor ve silindirlerle sağlanır. Bu nedenle ekskavatörün "performansı" esas olarak hidrolik akış-basınç yönetimi ve kontrol yazılımının kalitesine dayanır.'
        ],
        bullets: [
          'Alt takım: zemin basıncı, stabilite, taşıma lojistiği ve aşınma maliyetini belirler',
          'Hidrolik devre: pompa sayısı-deplajı, valf tipi (open center / load sensing) ve kontrol yazılımı',
          'İş ekipmanı geometrisi: kova kapasitesi, kazma kuvveti ve erişim çevrimi',
          'Elektronik katman: kumanda kolu (joystick) haritalaması, iş modları, telemetri'
        ]
      },
      {
        heading: 'Sınıf sınırları ve uygulama haritası',
        paragraphs: [
          'Pazar dilindeki sınıf adları üreticiden üreticiye kayar; aşağıdaki sınırlar tipik değerlerdir ve kesin bir standart oluşturmaz. Seçimde tonajdan çok, yapılacak işin çevrimi (döngü süresi, kazma derinliği, yükleme yüksekliği) ve sahanın zemin koşulu belirleyicidir.'
        ],
        table: {
          caption: 'Paletli ekskavatör sınıfları — tipik uygulama haritası',
          columns: ['Sınıf', 'Tipik işletme ağırlığı', 'Öne çıkan kullanım', 'Sınırlayıcı etken'],
          rows: [
            ['Mini / kompakt', '< 6 t', 'Kentsel çalışma, dar alan, iç mekân, bahçecilik', 'Kova kapasitesi, derin kazma'],
            ['Küçük', '6 – 13 t', 'Altyapı, kanal, peyzaj, hafif hafriyat', 'Ağır işlerde stabilite'],
            ['Orta', '13 – 30 t', 'Genel inşaat, yol, kırım, kentsel dönüşüm', 'Taşıma maliyeti, zemin basıncı'],
            ['Büyük', '30 – 80 t', 'Ağır hafriyat, ocak, büyük altyapı', 'Lojistik, nakliye izinleri'],
            ['Ağır / maden', '80 t ve üzeri', 'Açık ocak, maden, büyük hacimli yükleme', 'Yakıt-lojistik, servis altyapısı']
          ]
        }
      },
      {
        heading: 'Güç ve hidrolik mimari: verimlilik nereden gelir?',
        paragraphs: [
          'Klasik mimaride dizel motor, kavrama üzerinden bir veya birden fazla deplajlı pompaya bağlıdır. Yük duyarlı (load sensing) sistemler, valf açıklığına göre pompa deplajını ayarlayarak kısma kayıplarını azaltır; elektronik kumandalı sistemler ise iş modu ve operatör girdisine göre akış-basınç haritalarını dinamik yönetir.',
          'Elektrifikasyon bu sınıfta da kendini gösteriyor: hibrit güç paketleri (dizel + jeneratör + batarya) ve tam elektrikli kompakt modeller, özellikle kapalı mekân ve gürültü/emisyon kısıtlı sahalarda avantajlı. Elektrikli makine seçiminde belirleyici olan motor gücü değil, batarya kapasitesinin iş çevrimine yetip yetmediğidir.'
        ]
      },
      {
        heading: 'Alım ve işletmede bakılacaklar',
        paragraphs: [
          'Katalog karşılaştırması yaparken yalnızca kova kapasitesi ve kazma kuvvetine bakmak yetersizdir. Aşağıdaki kalemler, sahada toplam sahip olma maliyetini doğrudan etkiler:'
        ],
        bullets: [
          'Hidrolik akış ve basınç değerleri ile yardımcı (auxiliary) hat kapasitesi — kırım ataşmanı için kritik',
          'Yürüyüş aşınma parçalarının ömrü ve değişim maliyeti (palet zinciri, makara, planet redüktör)',
          'Servis aralıkları ve filtre-yağ kapasiteleri; telemetri ile uzaktan izleme altyapısı',
          'Yedek parça ve servis erişimi; ikinci el değer korunumu',
          'Operatör konforu: kabin yalıtımı, görüş açıları, joystick hassasiyeti — verimlilik doğrudan operatöre bağlıdır'
        ]
      }
    ],
    note: 'Sınıf sınırları ve tonaj aralıkları piyasa uygulamalarını yansıtan tipik değerlerdir; kesin teknik veriler için üretici kataloglarına başvurulmalıdır.',
    relatedGuides: ['hidrolik-sistem-verimliligi-enerji-kayiplari']
  },
  {
    slug: 'dizel-elektrikli-kompakt-ekskavator-karsilastirmasi',
    format: 'Karşılaştırma',
    title: 'Dizel mi elektrikli mi? Kompakt ekskavatörde mimari karşılaştırma',
    dek: 'Elektrikli kompakt iş makineleri artık prototip değil; ancak dizelin yerini alıp almayacağı iş çevrimine bağlı. Enerji kaynağından saha lojistiğine kadar sistem seviyesinde bir karşılaştırma.',
    updated: '2026-10-13',
    intro: [
      'Elektrikli iş makinesi tartışması çoğu zaman "yakıt vs şarj" düzeyinde kalır. Oysa karar noktası mimaridedir: güç aktarma zinciri, enerji depolama, saha lojistiği ve bakım modeli birlikte değerlendirilmeden verilen kararlar, sahada ya çalışma süresi ya da performans olarak geri döner.'
    ],
    table: {
      caption: 'Kompakt ekskavatörde mimari karşılaştırma',
      columns: ['Kriter', 'Dizel', 'Elektrikli'],
      rows: [
        ['Güç aktarma', 'Dizel motor + hidrolik pompa seti', 'Batarya + e-motor/inverter; e-pompa veya elektro-hidrolik'],
        ['Verim zinciri', 'Yanma verimi + hidrolik kayıplar; kısma kayıpları ısıya dönüşür', 'Batarya→inverter→motor zinciri daha yüksek verimli; rejenerasyon mümkün'],
        ['Emisyon & gürültü', 'Saha içi egzoz emisyonu, yüksek gürültü', 'Sıfır egzoz emisyonu, düşük gürültü — kapalı mekân/şehir içi avantaj'],
        ['İkmal lojistiği', 'Yakıt ikmali hızlı; yaygın altyapı', 'Şarj süresi ve gücü kritik; şarj altyapısı saha kurulumu gerektirir'],
        ['Çalışma süresi', 'Depo kapasitesiyle sınırlı, pratikte uzun', 'Batarya kapasitesine bağlı; mola şarjı ile yönetilir'],
        ['Bakım', 'Yağ-filtre-emisyon sonrası sistem bakım zinciri', 'Daha az hareketli parça; HV güvenlik ve batarya sağlığı takibi'],
        ['TCO kalemleri', 'Yakıt + emisyon bakımı + motor ömrü', 'Elektrik maliyeti + batarya ömrü/değişimi + şarj altyapısı'],
        ['Uygun saha', 'Kesintisiz uzun vardiya, uzak saha, güç gerektiren çevrimler', 'Kentsel alan, kapalı mekân, gürültü/emisyon kısıtlı, kısa-orta çevrim']
      ]
    },
    sections: [
      {
        heading: 'Mimari fark: güç nerede üretilir, nerede harcanır?',
        paragraphs: [
          'Dizel makinede güç, motor milinde üretilir ve hidrolik sistem üzerinden dağıtılır; her aşamada kayıp oluşur. Elektrikli makinede güç bataryada depolanır, inverter üzerinden motorlara (veya doğrudan e-pompa sürücülerine) iletilir. Elektrikli tahrikte kısmi yük verimi daha yüksektir; iş makinelerinin önemli bir kısmı kısmi yükte çalıştığı için bu, çevrim verimine doğrudan yansır.',
          'İkinci önemli fark, enerji geri kazanımıdır: elektrikli mimaride yavaşlatma ve indirme hareketlerinde enerji rejenerasyonu mümkünken, dizel makinede bu enerji hidrolik ısıya dönüşerek soğutucuya atılır.'
        ]
      },
      {
        heading: 'Saha lojistiği: asıl kritik konu',
        paragraphs: [
          'Elektrikli makine kararında gözden kaçan en büyük kalem şarj altyapısıdır. Saha elektrik gücü, şarj cihazı kapasitesi, kablo uzunlukları ve vardiya düzeni birlikte planlanmazsa makine katalog menzilinin çok altında çalışır. Mobil şarj üniteleri ve jeneratör destekli şarj çözümleri geçiş dönemini kolaylaştırır ama dizel jeneratörle beslenen bir şarj sisteminin toplam verimi ayrı bir hesap konusudur.',
          'Dizel tarafta avantaj bilinir: ikmali dakikalar sürer, altyapı yaygındır. Ancak kapalı mekân çalışmasında havalandırma ve egzoz gazı yönetimi maliyeti, dışarıdan bakıldığında görünmeyen bir kalemdir.'
        ]
      },
      {
        heading: 'Karar çerçevesi',
        paragraphs: [
          'Seçimi tek bir soru belirler: makinenin tipik iş çevrimi nedir? Kısa-orta süreli, öngörülebilir, şarj molasına uygun bir çevrim (şehir içi, kapalı mekân, belediye işleri) elektrikli mimariyi güçlü kılar. Kesintisiz uzun vardiya, şarj altyapısının zayıf olduğu uzak sahalar ve yüksek sürekli güç talebi ise dizeli (veya şimdilik hibriti) mantıklı kılar.'
        ],
        bullets: [
          'Çevrim öngörülebilir mi ve mola şarjı mümkün mü? → Elektrikli lehine',
          'Saha içi emisyon/gürültü kısıtı var mı? → Elektrikli lehine (regülasyon baskısı da artıyor)',
          'Sürekli yüksek güç ve uzak saha mı? → Dizel/hibrit lehine',
          'Toplam sahip olma maliyeti mi belirleyici? → Yakıt/elektrik fiyatı + batarya ömrü + bakım zinciri birlikte modellenmeli'
        ]
      }
    ],
    note: 'Karşılaştırma mimari düzeydedir; belirli modellerin performans ve menzil değerleri üretici verilerine dayanarak ayrı ayrı değerlendirilmelidir.',
    relatedGuides: ['mobil-makine-batarya-bms-mimari-temelleri', 'hidrolik-sistem-verimliligi-enerji-kayiplari']
  },
  {
    slug: 'hidrolik-yag-sicakligi-saha-rehberi',
    format: 'Saha Rehberi',
    title: 'Hidrolik yağ sıcaklığı yükseldiğinde: saha kontrol listesi',
    dek: 'Yağ sıcaklığı, hidrolik sistemin gizli verim ölçütüdür. Sıcaklık artışının olası nedenleri, kontrol sırası ve makineyi durdurmayı gerektiren durumlar.',
    updated: '2026-10-13',
    intro: [
      'Hidrolik sistemde harcanan enerjinin önemli bir kısmı ısıya dönüşür. Soğutucu üzerindeki sıcaklık farkının zamanla artması, çoğu zaman arızadan önce gelen bir uyarıdır. Bu rehber, sahada adım adım neyin kontrol edileceğini özetler.'
    ],
    sections: [
      {
        heading: 'Belirtiler: yalnızca sıcaklık göstergesi değil',
        paragraphs: [
          'Sıcaklık artışının yanında şu belirtiler görülebilir: çevrim sürelerinin uzaması, kumanda tepkilerinin gecikmesi, soğutucu fanının sürekli çalışması, yağ köpürmesi, sızdırmazlık elemanlarında erken sızıntı ve valflerden gelen artan ses. Bu belirtilerin kombinasyonu, kaybın nerede olduğunu daraltır.'
        ]
      },
      {
        heading: 'Olası nedenler',
        bullets: [
          'Soğutucu yüzeyinin kirlenmesi (toz, çamur, böcek) veya hava akışının engellenmesi',
          'Soğutucu fanı hidromotorunun veya tahrikinin zayıf çalışması',
          'Pompa içi sızıntısının artması (aşınma) — hacimsel verim düşüşü doğrudan ısı üretir',
          'Valf kısma kayıpları: sıkışmış oransal valf, yanlış kumanda haritası, aşınmış kontrol',
          'Yanlış yağ viskozitesi veya bozulmuş (oksitlenmiş) yağ',
          'Bekleme devresinde kalan yüksek basınç veya sürekli tahliye (bypass) üzerinden kontrol',
          'Soğutucu termostat veya bypass valfinin arızalı olması'
        ]
      },
      {
        heading: 'Kontrol sırası',
        paragraphs: [
          'Sahada en hızlı sonuç veren sıra şudur: önce soğutucu ve hava akışı, sonra yağ seviyesi-viskozitesi-durumu, ardından basınç-akış ölçümü ve en son bileşen teşhisi. Ölçüm yapmadan parça değiştirmek, hem maliyet hem arıza tespiti açısından en sık yapılan hatadır.'
        ],
        bullets: [
          '1) Soğutucu yüzeyini temizleyin; fan devrini ve hava yolunu kontrol edin',
          '2) Yağ seviyesini, viskoziteyi (örnek alın) ve yağ analizini kontrol edin',
          '3) Soğutucu giriş/çıkış sıcaklık farkını ve devre basınçlarını kaydedin',
          '4) Pompa sızıntı testi ve valf fonksiyon testi yapın',
          '5) Kumanda haritası/iş modu yazılımını ve termostat/bypass valfini doğrulayın',
          '6) Bulguları ve sıcaklık trendini makine kaydına işleyin'
        ]
      },
      {
        heading: 'Ne zaman durdurmalı?',
        paragraphs: [
          'Yağ sıcaklığı üretici limitlerinin sürekli üzerinde seyrediyorsa, köpürme veya ani sızıntı başlamışsa ya da çevrim performansı belirgin şekilde düşmüşse makine durdurulmalı ve soğuma sonrası teşhis yapılmalıdır. Aşırı sıcak yağ, sızdırmazlık elemanlarını ve pompayı kalıcı olarak hasarlandırır; "biraz daha çalışır" yaklaşımı, pompa değişim maliyetine kadar giden en pahalı karardır.'
        ]
      }
    ],
    note: 'Sıcaklık limitleri ve ölçüm noktaları makine üreticisine özgüdür; basınç altında çalışma gerektiren işlemler yalnızca yetkili servis prosedürleriyle yapılmalıdır.',
    relatedGuides: ['hidrolik-sistem-verimliligi-enerji-kayiplari']
  }
];
