import { useMutation, useQuery } from "convex/react";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  api,
  CATEGORIES,
  CONDITIONS,
  errorMessage,
  formatNumber,
  href,
  loginHref,
  MAX_IMAGES,
  parseNumber,
  SECTORS,
  type ManagedListing,
  type MemberUser,
  type Quota,
} from "../../lib/member";
import {
  canPublish,
  MemberGate,
  MemberProvider,
  useMember,
} from "./MemberProvider";

/**
 * İlan verme formu — sitenin kendi tasarımıyla.
 *
 * `?duzenle=<id>` ile aynı form düzenleme moduna geçer. Kuralların asıl
 * sahibi Convex tarafı (`listings:create` / `listings:update`); buradaki
 * kontroller yalnızca kullanıcıyı erken uyarır.
 */
export default function IlanForm({ convexUrl }: { convexUrl: string }) {
  return (
    <MemberProvider convexUrl={convexUrl}>
      <MemberGate
        title="İlan vermek için giriş yapın"
        description="Makinenizi listelemek için Makine Nabzı hesabınızla giriş yapın. İlanlar editör onayından sonra yayınlanır."
      >
        <FormLoader />
      </MemberGate>
    </MemberProvider>
  );
}

function FormLoader() {
  const { user } = useMember();
  const editId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("duzenle");
  }, []);
  const listings = useQuery(api.listings.myListings) as
    | ManagedListing[]
    | undefined;

  if (!canPublish(user)) return <VerifyNotice user={user} />;

  if (!editId) return <ListingFormFields />;

  if (listings === undefined) {
    return (
      <div className="member-card">
        <p className="member-note">İlan yükleniyor…</p>
      </div>
    );
  }

  const listing = listings.find((row) => row._id === editId);
  if (!listing) {
    return (
      <div className="member-empty">
        <h2>İlan bulunamadı.</h2>
        <p className="member-note">
          İlan silinmiş ya da bu hesaba ait olmayabilir.
        </p>
        <div className="member-actions member-actions-center">
          <a className="button primary" href={href("/hesabim/")}>
            İlanlarıma dön
          </a>
        </div>
      </div>
    );
  }

  return <ListingFormFields key={listing._id} listing={listing} />;
}

function VerifyNotice({ user }: { user: MemberUser | null }) {
  const anonymous = Boolean(user?.isAnonymous);
  return (
    <div className="member-card">
      <span className="eyebrow">Üyelik</span>
      <h2>
        {anonymous ? "Misafir hesapla ilan verilemez" : "E-posta doğrulaması gerekiyor"}
      </h2>
      <p className="member-note">
        {anonymous
          ? "İlan yayınlamak için e-posta adresinizle veya Google ile giriş yapın. Misafir hesaplar yalnızca gezinir."
          : "İlan verebilmek için e-posta adresinizi doğrulamanız gerekir. Giriş kodu e-postanıza gönderilir; şifre gerekmez."}
      </p>
      <div className="member-actions" style={{ marginTop: 18 }}>
        <a className="button primary" href={loginHref()}>
          {anonymous ? "Hesapla giriş yap" : "E-postayı doğrula"}
        </a>
        <a className="button ghost" href={href("/hesabim/")}>
          Hesabıma dön
        </a>
      </div>
    </div>
  );
}

function ListingFormFields({ listing }: { listing?: ManagedListing }) {
  const { user } = useMember();
  const create = useMutation(api.listings.create);
  const update = useMutation(api.listings.update);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);
  const quota = useQuery(api.listings.myQuota) as Quota | null | undefined;

  const isEditing = Boolean(listing);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [sector, setSector] = useState<string>(listing?.sector ?? SECTORS[0]);
  const [category, setCategory] = useState<string>(
    listing?.category ?? "satilik",
  );
  const [condition, setCondition] = useState<string>(listing?.condition ?? "");
  const [brand, setBrand] = useState(listing?.brand ?? "");
  const [model, setModel] = useState(listing?.model ?? "");
  const [year, setYear] = useState(
    listing?.year != null ? String(listing.year) : "",
  );
  const [hours, setHours] = useState(
    listing?.hours != null ? String(listing.hours) : "",
  );
  const [city, setCity] = useState(listing?.city ?? "");
  const [price, setPrice] = useState(
    listing?.price != null ? formatNumber(listing.price) : "",
  );
  const [priceHidden, setPriceHidden] = useState(
    Boolean(listing?.priceHidden),
  );
  const [contactName, setContactName] = useState(
    listing?.contactName ?? user?.name ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    listing?.contactPhone ?? "",
  );
  const [contactEmail, setContactEmail] = useState(
    listing?.contactEmail ?? user?.email ?? "",
  );
  const [images, setImages] = useState<{ id: string; url: string }[]>(
    (listing?.gallery ?? [])
      .filter((image) => image.url)
      .map((image) => ({ id: image.id, url: image.url as string })),
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const quotaFull = quota ? quota.used >= quota.quota : false;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setError(`En fazla ${MAX_IMAGES} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files).slice(0, room)) {
        if (file.size > 6 * 1024 * 1024) {
          throw new Error(`${file.name} 6 MB sınırını aşıyor.`);
        }
        const uploadUrl = await generateUploadUrl({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });
        if (!response.ok) throw new Error("Fotoğraf yüklenemedi.");
        const { storageId } = (await response.json()) as { storageId: string };
        setImages((current) => [
          ...current,
          { id: storageId, url: URL.createObjectURL(file) },
        ]);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Fotoğraf yüklenemedi.",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 10) {
      setError("Başlık en az 10 karakter olmalı.");
      return;
    }
    if (description.trim().length < 50) {
      setError("Açıklama en az 50 karakter olmalı.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setError("İletişim adı ve telefonu zorunludur.");
      return;
    }

    const priceValue = priceHidden ? undefined : parseNumber(price);
    if (!priceHidden && price.trim() && priceValue === undefined) {
      setError("Fiyat sayı olmalı; örneğin 2.450.000.");
      return;
    }

    setSaving(true);
    try {
      if (listing) {
        await update({
          listingId: listing._id,
          title,
          description,
          sector,
          category,
          price: priceHidden ? undefined : priceValue,
          priceHidden,
          city: city.trim() || undefined,
          contactName,
          contactPhone,
          images: images.map((image) => image.id),
        });
      } else {
        await create({
          title,
          description,
          sector,
          category,
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          year: parseNumber(year),
          hours: parseNumber(hours),
          condition: condition || undefined,
          city: city.trim() || undefined,
          price: priceValue,
          priceHidden,
          contactName,
          contactPhone,
          contactEmail: contactEmail.trim() || undefined,
          images: images.map((image) => image.id),
        });
      }
      window.location.assign(
        `${href("/hesabim/")}?islem=${listing ? "guncellendi" : "gonderildi"}`,
      );
    } catch (saveError) {
      setError(
        errorMessage(saveError, "İlan kaydedilemedi, tekrar deneyin."),
      );
      setSaving(false);
    }
  }

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <div>
        <span className="eyebrow">{isEditing ? "Düzenleme" : "Yeni ilan"}</span>
        <h2>{isEditing ? "İlanı düzenle" : "İlan bilgileri"}</h2>
        <p className="member-note" style={{ marginTop: 8 }}>
          {isEditing
            ? "Kaydettiğinizde ilan yeniden editör onayına gider; onaylanana kadar ilan yayında görünmez."
            : "İlan 60 gün yayında kalır. Alanları ne kadar net doldurursanız onay o kadar hızlı olur."}
        </p>
      </div>

      {quota && !isEditing && (
        <p className="member-alert ok">
          Aktif ilan hakkı: <strong>{quota.used}/{quota.quota}</strong>
          {quotaFull && " — hak doldu, önce bir ilanı kapatın."}
        </p>
      )}

      <div className="member-form-grid">
        <label className="member-field member-field-wide">
          <span>Başlık</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="2021 Komatsu PC210 LC-11 paletli ekskavatör"
            required
            minLength={10}
          />
          <small>Marka, model ve yıl başta olsun.</small>
        </label>

        <label className="member-field member-field-wide">
          <span>Açıklama</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={7}
            required
            minLength={50}
            placeholder="Bakım geçmişi, çalışma saati, lastik/palet durumu ve varsa kusurlar…"
          />
          <small>En az 50 karakter. Fotoğrafta görünmeyen kusurları yazın.</small>
        </label>

        <label className="member-field">
          <span>Sektör</span>
          <select
            value={sector}
            onChange={(event) => setSector(event.target.value)}
          >
            {SECTORS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="member-field">
          <span>İlan tipi</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="member-field">
          <span>Marka</span>
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Komatsu"
            disabled={isEditing}
          />
        </label>

        <label className="member-field">
          <span>Model</span>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="PC210"
            disabled={isEditing}
          />
        </label>
      </div>

      <div className="member-form-grid three">
        <label className="member-field">
          <span>Model yılı</span>
          <input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            inputMode="numeric"
            placeholder="2021"
            disabled={isEditing}
          />
        </label>
        <label className="member-field">
          <span>Çalışma saati</span>
          <input
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            inputMode="numeric"
            placeholder="8.400"
            disabled={isEditing}
          />
        </label>
        <label className="member-field">
          <span>Durum</span>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            disabled={isEditing}
          >
            <option value="">Belirtilmedi</option>
            {CONDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isEditing && (
        <p className="member-note">
          Marka, model, yıl, çalışma saati ve durum alanları ilan yayına
          girdikten sonra değiştirilemez; yanlışsa ilanı kaldırıp yeniden
          verebilirsiniz.
        </p>
      )}

      <div className="member-form-grid">
        <label className="member-field">
          <span>Konum</span>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ankara"
          />
        </label>

        <label className="member-field">
          <span>Fiyat (TRY)</span>
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="numeric"
            placeholder="2.450.000"
            disabled={priceHidden}
          />
          <small>Fiyat vermek istemiyorsanız aşağıdaki kutuyu işaretleyin.</small>
        </label>
      </div>

      <label className="member-check">
        <input
          type="checkbox"
          checked={priceHidden}
          onChange={(event) => setPriceHidden(event.target.checked)}
        />
        Fiyatı gizle, ilanda “fiyat sorunuz” yazsın
      </label>

      <div className="member-form-grid">
        <label className="member-field">
          <span>İletişim adı</span>
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            required
          />
        </label>
        <label className="member-field">
          <span>Telefon</span>
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            inputMode="tel"
            placeholder="0532 000 00 00"
            required
          />
          <small>Numara ilan sayfasında “Göster” ile açılır.</small>
        </label>
      </div>

      {!isEditing && (
        <label className="member-field">
          <span>E-posta (isteğe bağlı)</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="ad@sirket.com"
          />
        </label>
      )}

      <div className="member-field">
        <span>Fotoğraflar ({images.length}/{MAX_IMAGES})</span>
        <div className="member-photos">
          {images.map((image) => (
            <div key={image.id} className="member-photo">
              <img src={image.url} alt="İlan fotoğrafı" />
              <button
                type="button"
                aria-label="Fotoğrafı kaldır"
                onClick={() =>
                  setImages((current) =>
                    current.filter((row) => row.id !== image.id),
                  )
                }
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              className="member-add-photo"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Yükleniyor…" : "+ Fotoğraf"}
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <small>En fazla {MAX_IMAGES} fotoğraf, her biri 6 MB’a kadar.</small>
      </div>

      {error && <div className="member-alert err">{error}</div>}

      <div className="member-actions">
        <button
          type="submit"
          className="button primary"
          disabled={
            saving || uploading || (!isEditing && quotaFull)
          }
        >
          {saving
            ? "Kaydediliyor…"
            : isEditing
              ? "Değişiklikleri kaydet"
              : "Onaya gönder"}
        </button>
        <a className="button ghost" href={href("/hesabim/")}>
          Vazgeç
        </a>
      </div>

      <p className="member-fine">
        Göndererek ilan kurallarını kabul etmiş olursunuz. İlanlar editör
        onayından sonra yayınlanır; uygun olmayan ilanlar gerekçesiyle
        reddedilir.
      </p>
    </form>
  );
}
