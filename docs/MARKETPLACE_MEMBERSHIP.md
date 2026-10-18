# Makine Pazarı — üyelik ve ilan akışı

Bu belge pilot ekranları için alınan ürün kararını kaydeder. Pilot form yalnız tarayıcıda önizleme üretir; hesap açmaz, veri göndermez, ilan yayımlamaz.

## Erişim kuralları

| Eylem | Ziyaretçi | E-posta doğrulanmış üye | Yönetici |
| --- | --- | --- | --- |
| İlanları arama ve detayını görme | Evet | Evet | Evet |
| Pilot form önizlemesi | Evet | Evet | Evet |
| Gerçek ilan oluşturma/düzenleme | Hayır | Kendi ilanları | Evet |
| Satıcıya talep gönderme | Hayır | Evet | Evet |
| İlanı yayına alma veya kaldırma | Hayır | Hayır | Evet |

Mevcut uygulamada e-posta koduyla giriş ve anonim giriş vardır. İlan oluşturma ve iletişim mutasyonları **sunucuda** doğrulanmış, anonim olmayan kullanıcı kimliğini kontrol etmelidir. Arayüzde düğmeyi gizlemek tek başına yetki denetimi sayılmaz.

## Hesap ve ilan akışı

1. Üye e-posta koduyla giriş yapar; bireysel veya kurumsal satıcı profilini oluşturur.
2. Sektörleri, ilan türünü, makine bilgilerini, fiyatı ve kendisine ait fotoğrafları ekler.
3. İlan **taslak → incelemede → yayında** durumlarından geçer. Red nedeni satıcıya gösterilir. Düzenlenen yayındaki ilan yeniden incelemeye alınır.
4. Üye ilanını düzenleyebilir, pasife alabilir ve gelen talepleri kendi hesabında görebilir. Süresi dolan ilan yenilenmeden listelenmez.
5. İlgilenen üye iletişim talebi yollar. Satıcının e-posta ve telefonu açık sayfalarda varsayılan olarak gösterilmez.

İlan kaydında oluşturucu kullanıcı ID'si, durum, çoklu sektör, ekipman türü, satılık/kiralık, konum, fiyat ve fotoğraf referansları tutulur. Haber verisinden ayrı bir `listings` alanı kullanılır. Motor, şanzıman, aks ve yürüyüş grubu `Motor ve güç aktarma` türünde; uygun birden çok sektörde bulunabilir.

Kurumsal satıcıya yalnız şirket bilgisi kontrol edildikten sonra doğrulanmış rozeti verilir. Doğrulanmış e-posta, makinenin mülkiyetinin veya teknik durumunun doğrulandığı anlamına gelmez.

## Gerçek yayına geçiş öncesi

Mevcut Astro site statik olarak derleniyor; mevcut Convex uygulaması hesap girişini ve dinamik veriyi barındırıyor. Gerçek ilan formu bu kimlik doğrulamasıyla birlikte canlı veriye bağlanmalı, fotoğraflar yüklenmeli ve ilanlar yönetici onayından sonra yayımlanmalıdır. Pilotun temsili ilanları ve gerçek ilanlar aynı listede karışmamalıdır.
