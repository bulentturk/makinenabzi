export const sectors = [
  {
    slug: 'is-makinalari',
    title: 'İş Makinaları',
    kicker: 'Construction Equipment',
    description: 'Ekskavatör, yükleyici, dozer, greyder, kompakt ekipman ve yol makineleri.',
    image: '/sector-is-makinalari.webp'
  },
  {
    slug: 'madencilik',
    title: 'Madencilik',
    kicker: 'Mining',
    description: 'Yeraltı ve açık ocak makineleri, LHD, kamyon, delici, kırıcı ve otonom filo teknolojileri.',
    image: '/sector-madencilik.webp'
  },
  {
    slug: 'liman',
    title: 'Liman & Elleçleme',
    kicker: 'Ports & Handling',
    description: 'Reach stacker, terminal traktörü, vinç, konteyner elleçleme ve terminal otomasyonu.',
    image: '/sector-liman.webp'
  },
  {
    slug: 'tarim',
    title: 'Tarım Makinaları',
    kicker: 'Agricultural Machinery',
    description: 'Traktör, hasat, ekim, akıllı tarım, elektrifikasyon ve otonom saha sistemleri.',
    image: '/sector-tarim.webp'
  },
  {
    slug: 'arac-ustu-ekipman',
    title: 'Araç Üstü Ekipman',
    kicker: 'Truck-Mounted',
    description: 'Mobil vinç, beton ekipmanı, platform, pompa, belediye ve özel amaçlı üstyapılar.',
    image: '/sector-truck-mounted.webp'
  },
  {
    slug: 'havaalani-gse',
    title: 'Havalimanı & GSE',
    kicker: 'Ground Support Equipment',
    description: 'Uçak çekicileri, apron araçları, bagaj ve kargo yükleyicileri, yer güç üniteleri ve elektrikli GSE.',
    image: '/sector-gse.webp'
  },
  {
    slug: 'marine-yatcilik',
    title: 'Marine & Yatçılık',
    kicker: 'Marine Technology',
    description: 'Tekne ve yat tahriki, marine motorlar, elektrikli sistemler, pervaneler ve güverte ekipmanı.',
    image: '/sector-marine.webp'
  },
  {
    slug: 'elektrifikasyon',
    title: 'Elektrifikasyon & Dönüşüm',
    kicker: 'Electrification',
    description: 'Batarya, inverter, e-motor, şarj, retrofit, hibrit mimari ve termal yönetim.',
    image: '/sector-elektrifikasyon.webp'
  }
] as const;

export const technologies = [
  ['Elektrifikasyon', 'Batarya, BMS, inverter, e-motor, şarj ve HV mimarileri'],
  ['Hidrolik', 'Pompa, motor, valf, akışkan gücü, enerji verimliliği'],
  ['Yürüyüş & Güç Aktarma', 'Şanzıman, tork konvertörü, aks, diferansiyel, final drive, planet redüktör, palet zinciri, makara ve komple alt takım'],
  ['Elektronik & Telematik', 'VCU, HMI, CAN/J1939, CANopen, telemetri, veri toplama ve uzaktan servis'],
  ['Otonomi & AI', 'Algılama, makine görüşü, rota, operatör destek ve fiziksel AI'],
  ['Emisyon & Stage V', 'Motor, DPF, SCR, AdBlue ve emisyon sonrası arıtma'],
  ['Fonksiyonel Güvenlik', 'ISO 13849, makine güvenliği, güvenli kontrol mimarileri'],
  ['Termal Yönetim', 'Batarya, motor, inverter, şanzıman ve hidrolik soğutma']
] as const;

export const editorialFormats = [
  ['Haber', 'Doğrulanmış sektör ve teknoloji gelişmeleri', '/haberler/'],
  ['Teknik İnceleme', 'Bileşen ve sistem seviyesinde mühendislik analizi', '/teknik-blog/'],
  ['Makine Dosyası', 'Makine sınıfı, üreticiler, özellikler ve kullanım alanları', '/formatlar/paletli-ekskavator-sinifi-makine-dosyasi/'],
  ['Teknoloji Radar', 'Yükselen teknoloji, prototip ve Ar-Ge yönleri', '/formatlar/'],
  ['Karşılaştırma', 'Teknik özellik ve mimari karşılaştırmaları', '/formatlar/dizel-elektrikli-kompakt-ekskavator-karsilastirmasi/'],
  ['Saha Rehberi', 'Bakım, arıza belirtisi, seçim ve uygulama pratikleri', '/formatlar/hidrolik-yag-sicakligi-saha-rehberi/'],
  ['Pazar & Veri', 'Üretim, ihracat, satış ve yatırım göstergeleri', '/formatlar/'],
  ['Fuar & Etkinlik', 'Takvim, lansmanlar ve etkinlik sonrası teknik özet', '/fuar-takvimi/']
] as const;
