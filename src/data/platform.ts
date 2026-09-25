export const sectors = [
  {
    slug: 'is-makinalari',
    title: 'İş Makinaları',
    kicker: 'Construction Equipment',
    description: 'Ekskavatör, yükleyici, dozer, greyder, kompakt ekipman ve yol makineleri.',
    image: 'https://images.unsplash.com/photo-1764422743505-97c9ea0e43f2?auto=format&fit=crop&w=1600&q=82'
  },
  {
    slug: 'madencilik',
    title: 'Madencilik',
    kicker: 'Mining',
    description: 'Yeraltı ve açık ocak makineleri, LHD, kamyon, delici, kırıcı ve otonom filo teknolojileri.',
    image: 'https://images.unsplash.com/photo-1786209273552-3b57dec47c94?auto=format&fit=crop&w=1600&q=82'
  },
  {
    slug: 'liman',
    title: 'Liman & Elleçleme',
    kicker: 'Ports & Handling',
    description: 'Reach stacker, terminal traktörü, vinç, konteyner elleçleme ve terminal otomasyonu.',
    image: 'https://images.unsplash.com/photo-1773952984178-f91248ce704f?auto=format&fit=crop&w=1600&q=82'
  },
  {
    slug: 'tarim',
    title: 'Tarım Makinaları',
    kicker: 'Agricultural Machinery',
    description: 'Traktör, hasat, ekim, akıllı tarım, elektrifikasyon ve otonom saha sistemleri.',
    image: 'https://images.unsplash.com/photo-1775931307655-2aed7e013020?auto=format&fit=crop&w=1600&q=82'
  },
  {
    slug: 'arac-ustu-ekipman',
    title: 'Araç Üstü Ekipman',
    kicker: 'Truck-Mounted',
    description: 'Mobil vinç, beton ekipmanı, platform, pompa, belediye ve özel amaçlı üstyapılar.',
    image: 'https://images.unsplash.com/photo-1764422743505-97c9ea0e43f2?auto=format&fit=crop&w=1600&q=82'
  },
  {
    slug: 'elektrifikasyon',
    title: 'Elektrifikasyon & Dönüşüm',
    kicker: 'Electrification',
    description: 'Batarya, inverter, e-motor, şarj, retrofit, hibrit mimari ve termal yönetim.',
    image: 'https://images.unsplash.com/photo-1764422743505-97c9ea0e43f2?auto=format&fit=crop&w=1600&q=82'
  }
] as const;

export const technologies = [
  ['Elektrifikasyon', 'Batarya, BMS, inverter, e-motor, şarj ve HV mimarileri'],
  ['Hidrolik', 'Pompa, motor, valf, akışkan gücü, enerji verimliliği'],
  ['Güç Aktarma', 'Powershift, hidrostatik, e-aks, diferansiyel ve redüktör'],
  ['CAN & Telematik', 'J1939, CANopen, telemetri, veri toplama ve uzaktan servis'],
  ['Otonomi & AI', 'Algılama, makine görüşü, rota, operatör destek ve fiziksel AI'],
  ['Emisyon & Stage V', 'Motor, DPF, SCR, AdBlue ve emisyon sonrası arıtma'],
  ['Fonksiyonel Güvenlik', 'ISO 13849, makine güvenliği, güvenli kontrol mimarileri'],
  ['Termal Yönetim', 'Batarya, motor, inverter, şanzıman ve hidrolik soğutma']
] as const;

export const editorialFormats = [
  ['Haber', 'Doğrulanmış sektör ve teknoloji gelişmeleri'],
  ['Teknik İnceleme', 'Bileşen ve sistem seviyesinde mühendislik analizi'],
  ['Makine Dosyası', 'Makine sınıfı, üreticiler, özellikler ve kullanım alanları'],
  ['Teknoloji Radar', 'Yükselen teknoloji, prototip ve Ar-Ge yönleri'],
  ['Karşılaştırma', 'Teknik özellik ve mimari karşılaştırmaları'],
  ['Saha Rehberi', 'Bakım, arıza belirtisi, seçim ve uygulama pratikleri'],
  ['Pazar & Veri', 'Üretim, ihracat, satış ve yatırım göstergeleri'],
  ['Fuar & Etkinlik', 'Takvim, lansmanlar ve etkinlik sonrası teknik özet']
] as const;
