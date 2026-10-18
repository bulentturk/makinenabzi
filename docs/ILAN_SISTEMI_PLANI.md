# Makine Nabzı — İlan ve Üyelik Sistemi Planı

Durum: **taslak / karar bekliyor**. Bu belge, sitede ilan verme + ilanlarda gezinme +
üyelik/iyelik sisteminin nasıl kurulacağını tanımlar.

---

## 1. Amaç

- Her sektörde (iş makinaları, madencilik, liman, tarım, araç üstü ekipman,
  elektrifikasyon, marine) **ilan verilebilsin**.
- İlanlar **site üzerinde gezinilebilsin** (SEO'lu, arama motorundan bulunabilir).
- Her ilanın bir **sahibi** olsun: sadece sahibi düzenleyebilsin, kapatsın, "satıldı"
  işaretleyebilsin.
- Aynı hesap hem **sitede** hem **Android uygulamasında** geçerli olsun.
- Aynı veri katmanı ileride mobil uygulamaya da ilan ekranları sağlasın.

## 2. Mevcut teknik gerçekler (kısıtlar)

| Bileşen | Durum | Sonuç |
| --- | --- | --- |
| `makinenabzi.com` | Astro 6, **statik** üretim, GitHub Pages | Sayfa üretimi derleme anında; sunucu kodu çalıştıramaz |
| Etkileşimli akışlar | Sitede istemci tarafı JS (iletişim formu GitHub Issue açıyor) | Formlar tarayıcıda çalışır, backend ayrı serviste olmalı |
| `app/` (Vite + React + Convex) | Vercel'de `app.makinenabzi.com` | React + Convex Auth kodu hazır, yeniden kullanılabilir |
| Convex backend | `flexible-ibex-197` (dev), auth anahtarları kuruldu | `listings`, `companies`, `users`, `bookmarks`, `notifications` tabloları hazır |
| Mobil uygulama | Android (Capacitor), aynı Convex'e bağlı | İlan ekranları aynı fonksiyonlarla beslenir |

**Temel karar:** Convex **tek veri katmanı** olur. Site statik kalır; ilan verileri
derleme anında Convex'ten çekilip statik sayfalara gömülür, yazma işlemleri
tarayıcıdan Convex'e yapılır. Böylece GitHub Pages altyapısı bozulmadan SEO korunur.

## 3. Veri modeli (Convex)

Mevcut `listings` tablosu genişletilir:

```ts
listings: {
  slug: string,              // URL: /ilanlar/satilik-ekskavator-xxx
  title: string,
  description: string,
  sector: string,            // İş Makinaları | Madencilik | Liman & Elleçleme | ...
  category: "satilik" | "kiralik" | "yedek-parca" | "hizmet",
  // makine künyesi
  brand?: string,
  model?: string,
  year?: number,
  hours?: number,            // çalışma saati
  condition?: "sifir" | "ikinci-el" | "yenilenmis",
  powerKw?: number,
  weightKg?: number,
  // konum ve fiyat
  city?: string,
  country?: string,
  price?: number,
  currency?: string,
  priceHidden?: boolean,     // "fiyat sorunuz"
  // sahiplik
  ownerId: v.id("users"),    // zorunlu: her ilanın bir sahibi var
  companyId?: v.id("companies"),
  contactName: string,
  contactPhone: string,
  contactEmail?: string,
  // yayın
  status: "draft" | "pending" | "approved" | "rejected" | "sold" | "expired",
  rejectionReason?: string,
  images: v.array(v.id("_storage")),   // Convex dosya depolama
  coverImage?: v.id("_storage"),
  views: number,
  expiresAt: number,         // örn. 60 gün sonra otomatik kapanır
  bumpedAt?: number,         // öne çıkarma
  featuredUntil?: number,
  createdAt: number,
  updatedAt: number,
}
```

Yardımcı tablolar:

```ts
// Üyelik profili (firma ya da bireysel satıcı)
profiles: {
  userId: v.id("users"),
  type: "bireysel" | "bayi" | "servis" | "oem" | "kurumsal",
  displayName: string,
  companyId?: v.id("companies"),
  city?: string,
  phone?: string,
  about?: string,
  logoStorageId?: v.id("_storage"),
  verification: "yok" | "bekliyor" | "dogrulandi",
  listingQuota: number,       // eşzamanlı aktif ilan hakkı
  createdAt: number,
}

// İlan şikayeti / moderasyon kaydı
listingReports: {
  listingId: v.id("listings"),
  reporterId: v.id("users"),
  reason: string,
  note?: string,
  status: "acik" | "incelendi" | "reddedildi",
  createdAt: number,
}

// Görüntülenme/favori (opsiyonel, 2. faz)
listingFavorites: {
  listingId: v.id("listings"),
  userId: v.id("users"),
  createdAt: number,
}
```

## 4. Üyelik ve iyelik (yetki kuralları)

**Kimlik:** Convex Auth (e-posta tek kullanımlık kod + misafir). Site ve uygulama
**aynı hesapları** kullanır. İlan vermek için e-posta doğrulaması şart; misafir
(anonim) hesaplar yalnızca gezinir.

**İyelik zinciri:** `listings.ownerId → users._id` ve isteğe bağlı
`listings.companyId → companies._id`. Kontrol **her zaman sunucu tarafında**
(Convex fonksiyonunda) yapılır; istemciden gelen `ownerId` asla kabul edilmez.

| İşlem | Kim yapabilir |
| --- | --- |
| İlanları görüntüleme | Herkes (giriş gerekmez) |
| İlan verme | Doğrulanmış e-postalı üye, kota kadar |
| Kendi ilanını düzenleme / silme | Yalnızca sahibi (`ownerId`) |
| "Satıldı" işaretleme | Yalnızca sahibi |
| İlanı onaylama / reddetme | `role: admin` |
| Firma profili doğrulama | `role: admin` |
| Şikayet etme | Giriş yapmış herhangi bir üye |

**Yetki matrisi kod tarafında** `convex/lib/authz.ts` benzeri tek bir yardımcıda
toplanır: `requireUser`, `requireOwner`, `requireAdmin`. Böylece kural tek yerde
kalır ve mobil uygulama da aynı kuralları kullanır.

## 5. İlan yaşam döngüsü

```
draft ──(sahibi gönderir)──> pending ──(admin onay)──> approved ──(süre/sahip)──> expired
                                 │                          │
                                 └──(admin red)──> rejected  └──(sahip işaretler)──> sold
```

- `pending` ilanlar sitede **görünmez**, yalnızca sahibine "inceleniyor" olarak görünür.
- `approved` ilan statik derlemeye girer ve arama motoruna açılır.
- `expired`/`sold` ilan detay sayfası kalır (SEO ve bağlantı bütünlüğü) ama
  "bu ilan kapatıldı" bandı gösterir ve listede çıkmaz.

## 6. Sayfa haritası (site)

| URL | Tür | İçerik |
| --- | --- | --- |
| `/ilanlar/` | statik | Tüm sektörler, son ilanlar, filtre paneli |
| `/ilanlar/[sektor]/` | statik | Sektöre özel ilan listesi (örn. `/ilanlar/is-makinalari/`) |
| `/ilanlar/[sektor]/[slug]/` | statik | İlan detayı, galeri, künye tablosu, iletişim |
| `/ilan-ver/` | ada (island) | Giriş + ilan formu |
| `/hesabim/` | ada (island) | Üyelik bilgileri, ilanlarım, düzenle/sil/satıldı |
| `/firma/[slug]/` | statik | Firma profili ve ilanları |
| `/ilan-kurallari/` | statik | İlan kuralları, yasak içerik, KVKK metni |

SEO: her ilan ve liste sayfasına `ItemList` / `Product` + `Offer` JSON-LD, kanonik
URL, `og:image` (kapak görseli). Mevcut `BaseLayout` bunların hepsini destekliyor.

## 7. Yayına alma akışı

```
İlan veren (tarayıcı)  ──yazma──>  Convex (pending)
                                     │  admin onayı
                                     ▼
                                  approved
                                     │
     GitHub Actions (saatlik)  ──okuma(HTTP API)──>  src/data/listings.json
                                     │
                                     ▼
                          astro build  ──>  GitHub Pages  ──>  /ilanlar/...
```

- Okuma için Convex HTTP API'de **herkese açık** bir sorgu yeterlidir
  (`/api/query` + onaylı ilanları döndüren fonksiyon). Bu yöntem doğrulandı.
- `src/data/listings.json` aynı zamanda mobil uygulamaya da servis edilebilir
  (haberlerde kullanılan `feed.json` deseniyle aynı mantık).
- Yazma işlemleri tarayıcıdan Convex'e gider; statik site yalnızca okuma yapar.

## 8. Moderasyon ve güvenlik

- **Ön onay:** `pending → approved` yalnızca editör onayıyla (mevcut haber
  iş akışındaki "editoryal onay" ilkesiyle tutarlı).
- **Kota:** üye başına eşzamanlı aktif ilan sınırı (örn. 3); doğrulanmış firma daha fazla.
- **Görsel:** en fazla 8 görsel, dosya başına 5 MB, yalnızca jpg/png/webp.
- **Spam:** aynı içeriği tekrarlayan ilanı engelle (başlık + telefon karması), saatlik
  gönderim sınırı, telefon doğrulaması (2. faz).
- **Şikayet:** her ilanda "bildir" bağlantısı; 3 şikayet gelen ilan otomatik
  incelemeye düşer.
- **KVKK:** iletişim bilgileri yalnızca ilan sayfasında gösterilir; telefon
  numarasının bir kısmı maskelenir ve "göster" ile açılır (bot kazımayı azaltır).
- **Kullanıcı silme talebi:** `profiles` ve `listings` için anonimleştirme akışı.

## 9. Mobil uygulama entegrasyonu

Uygulamada "Pazar" sekmesi eklendi (`src/components/app/MarketView.tsx`):
ilan vitrini + filtreler, ilan detayı, "İlan ver" formu (fotoğraf yükleme dahil),
"İlanlarım" ekranı ve editörler için moderasyon kuyruğu. Hepsi mevcut Convex
fonksiyonlarını çağırır; ek backend gerekmedi.

Sitedeki `/ilan-ver/` şu an tanıtım sayfası. Etkileşimli form oraya ayrı bir
React adası olarak eklenecek; site ile Convex farklı alan adlarında olduğu için
çerez/oturum davranışının ayrıca sınanması gerekiyor.

## 10. Aşamalar

**Faz 1 — Veri ve üyelik temeli**
1. `listings` şemasını genişlet (slug, sector, marka/model, görsel, expiresAt).
2. `profiles` tablosu + `requireOwner`/`requireAdmin` yetki yardımcıları.
3. `listings:create/update/remove/markSold/approve` fonksiyonları.
4. Görsel yükleme (Convex storage) için `generateUploadUrl`.

**Faz 2 — Site vitrini (statik)**
5. `scripts/sync-listings.mjs` + GitHub Actions saatlik görev.
6. `/ilanlar/`, `/ilanlar/[sektor]/`, `/ilanlar/[sektor]/[slug]/` sayfaları + JSON-LD.
7. Sektör filtreleri, arama, sayfalama.

**Faz 3 — Üye alanı (etkileşimli)**
8. Uygulamada "Pazar" sekmesi: vitrin, ilan detayı, ilan ver, ilanlarım, moderasyon. ✅
9. `/ilan-ver/` formu (React adası + Convex Auth). ⏳
10. `/hesabim/` — ilanlarım, düzenle, satıldı işaretle.
11. `/firma/[slug]/` profil sayfası.

**Faz 4 — İşletme**
12. Moderasyon kuyruğu (uygulamada var, sitede editör paneli yok). ✅ / ⏳
13. Şikayet listesi ekranı (şikayet kaydı var, listeleme yok). ⏳
14. Ücretli öne çıkarma (opsiyonel, sonra karar).
15. Telefon doğrulaması ve gelişmiş spam koruması.

## 12. Açık blokaj: giriş e-postası

E-posta kodu gönderimi `RESEND_API_KEY` ve `AUTH_EMAIL_FROM` ortam
değişkenlerine bağlı; ikisi de tanımlı değil. Bu yüzden uygulamada **hiçbir**
kullanıcı e-posta ile giriş yapamıyor ve doğrulanmış satıcı olamıyor. Misafir
hesaplar ilan veremez (tasarm gereği), dolayısıyla ilan verme akışı uçtan uca
henüz denenemedi. Anahtarlar tanımlandığında akış kendiliğinden açılır.

## 11. Onaylanan kararlar

| Karar | Seçim |
| --- | --- |
| Üye alanı | **Hem sitede hem app panelinde.** Kimlik Convex Auth'ta ortak olduğu için hesaplar iki ortamda aynıdır; ekranlar ortak Convex fonksiyonlarını kullanır. |
| İlan veren | **Bireysel + firma.** Doğrulanmamış satıcı "bireysel" etiketiyle görünür. |
| Yayın modeli | **Ön onay.** `pending → approved` yalnızca editör onayıyla. |
| Görseller | **Convex depolama.** Yükleme `generateUploadUrl`, okuma imzalı URL. |
| İlan süresi / kota | 60 gün; bireysel 3, doğrulanmış firma 10 aktif ilan (profil bazında artırılabilir). |

### Üyelik neden iki ortamda da çalışır

Kimlik doğrulama Convex'te tutulduğu için tek hesap hem `makinenabzi.com`
hem Android uygulaması için geçerlidir. Sitede `/ilan-ver/` ve `/hesabim/`
sayfaları, uygulamada ise "İlan Ver" / "İlanlarım" ekranları **aynı** Convex
fonksiyonlarını çağırır; kurallar tek yerde (`listings.ts` + `lib/authz.ts`)
tanımlıdır. Böylece bir ortamda verilen ilan diğerinde anında görünür.
