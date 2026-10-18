export type DemoListing = {
  slug: string;
  title: string;
  offer: 'sale' | 'rent';
  sectors: string[];
  category: string;
  brand: string;
  model: string;
  year: number;
  hours: number | null;
  location: string;
  price: string;
  condition: string;
  image: string;
  description: string;
  details: string[];
};

export const categories = [
  'İş makinesi',
  'Maden makinesi',
  'Liman ekipmanı',
  'Tarım makinesi',
  'Araç üstü ekipman',
  'Havalimanı ekipmanı',
  'Marine ekipmanı',
  'Motor ve güç aktarma'
];

export const demoListings: DemoListing[] = [
  {
    slug: 'ornek-22-ton-ekskavator', title: '22 ton paletli ekskavatör', offer: 'sale',
    sectors: ['is-makinalari'], category: 'İş makinesi', brand: 'Örnek marka', model: 'EX 220',
    year: 2021, hours: 4350, location: 'İstanbul', price: '₺3.450.000', condition: 'İkinci el',
    image: '/sector-is-makinalari.webp',
    description: 'Kazı ve yükleme işlerinde kullanılan 22 ton sınıfı bir makine için örnek ilan düzeni.',
    details: ['22 ton sınıfı', 'Paletli yürüyüş', 'Servis geçmişi alanı']
  },
  {
    slug: 'ornek-yeralti-yukleyici', title: 'Yeraltı yükleyici, 10 ton sınıfı', offer: 'rent',
    sectors: ['madencilik'], category: 'Maden makinesi', brand: 'Örnek marka', model: 'UL 10',
    year: 2022, hours: 2100, location: 'Zonguldak', price: '₺185.000 / ay', condition: 'İkinci el',
    image: '/sector-madencilik.webp',
    description: 'Yeraltı madenciliği için yükleme ekipmanının kiralama teklifinde gösterilecek alanlar.',
    details: ['10 ton sınıfı', 'Aylık kiralama', 'Operatör koşulları ayrıca belirtilir']
  },
  {
    slug: 'ornek-reach-stacker', title: '45 ton reach stacker', offer: 'sale',
    sectors: ['liman'], category: 'Liman ekipmanı', brand: 'Örnek marka', model: 'RS 45',
    year: 2019, hours: 7200, location: 'Kocaeli', price: 'Fiyat sorunuz', condition: 'İkinci el',
    image: '/sector-liman.webp',
    description: 'Konteyner elleçleme ekipmanında kapasite ve bakım bilgilerini öne çıkaran örnek ilan.',
    details: ['45 ton sınıfı', 'Konteyner elleçleme', 'Bakım raporu alanı']
  },
  {
    slug: 'ornek-traktor-120-hp', title: '120 HP tarla traktörü', offer: 'sale',
    sectors: ['tarim'], category: 'Tarım makinesi', brand: 'Örnek marka', model: 'TR 120',
    year: 2023, hours: 860, location: 'Konya', price: '₺2.150.000', condition: 'İkinci el',
    image: '/sector-tarim.webp',
    description: 'Tarım makinesi ilanında çalışma saati ve ekipman bilgisinin nasıl sunulacağını gösterir.',
    details: ['120 HP sınıfı', 'Dört çeker', 'Ekipman listesi alanı']
  },
  {
    slug: 'ornek-arac-ustu-platform', title: '30 m araç üstü platform', offer: 'rent',
    sectors: ['arac-ustu-ekipman', 'is-makinalari'], category: 'Araç üstü ekipman',
    brand: 'Örnek marka', model: 'AP 30', year: 2020, hours: 3100, location: 'Ankara',
    price: '₺38.000 / hafta', condition: 'İkinci el', image: '/sector-truck-mounted.webp',
    description: 'Bir ekipmanın birden fazla sektörde bulunabilmesini gösteren kiralık ilan örneği.',
    details: ['30 m erişim sınıfı', 'Haftalık kiralama', 'Nakliye koşulları alanı']
  },
  {
    slug: 'ornek-elektrikli-bagaj-cekicisi', title: 'Elektrikli bagaj çekicisi', offer: 'rent',
    sectors: ['havaalani-gse', 'elektrifikasyon'], category: 'Havalimanı ekipmanı',
    brand: 'Örnek marka', model: 'GSE E-Tug', year: 2024, hours: 650, location: 'Antalya',
    price: '₺72.000 / ay', condition: 'İkinci el', image: '/sector-gse.webp',
    description: 'Apron ve yer destek operasyonları için elektrikli ekipmanın kiralama örneği.',
    details: ['Elektrikli tahrik', 'Aylık kiralama', 'Batarya durumu alanı']
  },
  {
    slug: 'ornek-marine-dizel-motor', title: 'Marine dizel motor, 500 HP sınıfı', offer: 'sale',
    sectors: ['marine-yatcilik'], category: 'Marine ekipmanı', brand: 'Örnek marka', model: 'MD 500',
    year: 2021, hours: 1400, location: 'Muğla', price: '₺1.380.000', condition: 'İkinci el',
    image: '/sector-marine.webp',
    description: 'Marine motorlar için güç, saat ve servis kayıtlarını öne çıkaran örnek sayfa.',
    details: ['500 HP sınıfı', 'Marine uygulama', 'Servis raporu alanı']
  },
  {
    slug: 'ornek-elektrikli-mini-ekskavator', title: 'Elektrikli kompakt ekskavatör', offer: 'sale',
    sectors: ['elektrifikasyon', 'is-makinalari'], category: 'İş makinesi',
    brand: 'Örnek marka', model: 'E-Mini 8', year: 2024, hours: 320, location: 'İzmir',
    price: '₺2.780.000', condition: 'İkinci el', image: '/sector-elektrifikasyon.webp',
    description: 'Elektrifikasyon etiketiyle iş makinesi sektöründe de bulunabilen örnek ilan.',
    details: ['8 ton sınıfı', 'Elektrikli tahrik', 'Şarj koşulları alanı']
  },
  {
    slug: 'ornek-altisilindir-dizel-motor', title: '6 silindir dizel motor', offer: 'sale',
    sectors: ['is-makinalari', 'tarim', 'madencilik'], category: 'Motor ve güç aktarma',
    brand: 'Örnek marka', model: 'D6 Power', year: 2022, hours: 1800, location: 'Bursa',
    price: '₺680.000', condition: 'İkinci el', image: '/sector-is-makinalari.webp',
    description: 'Birden çok makine sektörüne hitap eden dizel motor bileşeni için ilan örneği.',
    details: ['6 silindir', 'Uyumluluk listesi alanı', 'Test raporu alanı']
  },
  {
    slug: 'ornek-sanziman-aks-seti', title: 'Şanzıman ve aks seti', offer: 'rent',
    sectors: ['liman', 'arac-ustu-ekipman'], category: 'Motor ve güç aktarma',
    brand: 'Örnek marka', model: 'Drive 4', year: 2023, hours: null, location: 'Mersin',
    price: 'Teklif alın', condition: 'Revizyonlu', image: '/sector-liman.webp',
    description: 'Güç aktarma bileşenleri için uyumluluk ve kiralama koşullarının yerleşimini gösterir.',
    details: ['Şanzıman ve aks', 'Uyumluluk doğrulaması alanı', 'Revizyon belgesi alanı']
  }
];
