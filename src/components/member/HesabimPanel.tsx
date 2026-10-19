import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  api,
  CATEGORY_LABEL,
  errorMessage,
  formatDate,
  formatNumber,
  formatPrice,
  href,
  listingHref,
  loginHref,
  STATUS,
  type ManagedListing,
  type Quota,
} from "../../lib/member";
import { MemberGate, MemberProvider, useMember } from "./MemberProvider";

type Flash = { tone: "ok" | "err"; text: string } | null;

/**
 * Sitenin kendi tasarımıyla çalışan üye paneli.
 *
 * Uygulamadaki (`/app/`) hesapla aynı Convex fonksiyonlarını kullanır:
 * ilanlarım, kota ve editör onay kuyruğu. Görsel dil tamamen siteye aittir.
 */
export default function HesabimPanel({ convexUrl }: { convexUrl: string }) {
  return (
    <MemberProvider convexUrl={convexUrl}>
      <MemberGate
        title="Hesabınızı görmek için giriş yapın"
        description="İlanlarınızı, onay durumlarını ve editör kuyruğunu bu sayfadan yönetin."
      >
        <Panel />
      </MemberGate>
    </MemberProvider>
  );
}

function Panel() {
  const { user, signOut } = useMember();
  const listings = useQuery(api.listings.myListings) as
    | ManagedListing[]
    | undefined;
  const quota = useQuery(api.listings.myQuota) as Quota | null | undefined;
  const pending = useQuery(api.listings.pendingQueue) as
    | ManagedListing[]
    | undefined;

  const isEditor = user?.role === "admin";
  const [tab, setTab] = useState<"ilanlarim" | "moderasyon">("ilanlarim");
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    const amount = new URLSearchParams(window.location.search).get("islem");
    if (amount === "gonderildi") {
      setFlash({
        tone: "ok",
        text: "İlanınız editör onayına gönderildi. Onaylandığında ilanlar sayfasında yayınlanır.",
      });
    } else if (amount === "guncellendi") {
      setFlash({
        tone: "ok",
        text: "İlanınız güncellendi ve yeniden editör onayına gönderildi.",
      });
    }
    if (amount) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 9000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const rows = listings ?? [];
  const approved = rows.filter((row) => row.status === "approved").length;
  const waiting = rows.filter((row) => row.status === "pending").length;
  const views = rows.reduce((total, row) => total + (row.views ?? 0), 0);
  const displayName = user?.name?.trim() || user?.email?.split("@")[0];
  const firstName = displayName?.split(/\s+/)[0];

  return (
    <div className="member-shell">
      <div className="member-top">
        <div>
          <span className="eyebrow">Hesap</span>
          <h2>{firstName ? `Merhaba, ${firstName}` : "Üye paneli"}</h2>
          <p className="member-meta">
            {user?.isAnonymous
              ? "Misafir hesap"
              : user?.email ?? "E-posta tanımlı değil"}
            {isEditor && <span className="member-role">Editör</span>}
          </p>
        </div>
        <div className="member-actions">
          {user?.isAnonymous ? (
            <a className="button primary" href={loginHref()}>
              Hesaba giriş yap
            </a>
          ) : (
            <a className="button primary" href={href("/ilan-ver/")}>
              + Yeni ilan
            </a>
          )}
          <button
            type="button"
            className="button ghost member-signout"
            onClick={() => void signOut()}
          >
            Çıkış yap
          </button>
        </div>
      </div>

      {user?.isAnonymous && (
        <div className="member-alert info">
          Misafir olarak geziyorsunuz. İlan vermek ve ilanlarınızı kalıcı olarak
          takip etmek için <a href={loginHref()}>hesabınıza giriş yapın</a>.
        </div>
      )}

      {flash && <div className={`member-alert ${flash.tone}`}>{flash.text}</div>}

      <div className="member-stats">
        <div className="member-stat">
          <span>Yayında</span>
          <strong>{approved}</strong>
        </div>
        <div className="member-stat">
          <span>Onay bekleyen</span>
          <strong>{waiting}</strong>
        </div>
        <div className="member-stat">
          <span>Görüntülenme</span>
          <strong>{formatNumber(views)}</strong>
        </div>
        <div className="member-stat">
          <span>Aktif ilan hakkı</span>
          <strong>
            {quota ? `${quota.used}/${quota.quota}` : "—"}
            {quota && quota.used >= quota.quota && (
              <small>dolu</small>
            )}
          </strong>
        </div>
      </div>

      {isEditor && (
        <div className="member-tabs" role="tablist" aria-label="Üye paneli">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "ilanlarim"}
            className="member-tab"
            onClick={() => setTab("ilanlarim")}
          >
            İlanlarım
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "moderasyon"}
            className="member-tab"
            onClick={() => setTab("moderasyon")}
          >
            Onay kuyruğu
            {pending && pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        </div>
      )}

      {tab === "moderasyon" && isEditor ? (
        <ModerationQueue rows={pending} onFlash={setFlash} />
      ) : (
        <section aria-label="İlanlarım">
          {listings === undefined ? (
            <div className="member-card">
              <p className="member-note">İlanlar yükleniyor…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="member-empty">
              <h2>Henüz ilanınız yok.</h2>
              <p className="member-note">
                Makinenizi fotoğraflarıyla yükleyin; editör onayından sonra
                ilanlar bölümünde yayınlanır.
              </p>
              <div className="member-actions member-actions-center">
                <a
                  className="button primary"
                  href={user?.isAnonymous ? loginHref() : href("/ilan-ver/")}
                >
                  {user?.isAnonymous ? "Hesaba giriş yap" : "İlk ilanı ver"}
                </a>
              </div>
            </div>
          ) : (
            <div className="member-list">
              {rows.map((listing) => (
                <ListingRow
                  key={listing._id}
                  listing={listing}
                  onFlash={setFlash}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ListingRow({
  listing,
  onFlash,
}: {
  listing: ManagedListing;
  onFlash: (flash: Flash) => void;
}) {
  const remove = useMutation(api.listings.remove);
  const markSold = useMutation(api.listings.markSold);
  const relist = useMutation(api.listings.relist);
  const [busy, setBusy] = useState<string | null>(null);

  const status = STATUS[listing.status];

  async function run(
    action: string,
    work: () => Promise<unknown>,
    done: string,
  ) {
    setBusy(action);
    try {
      await work();
      onFlash({ tone: "ok", text: done });
    } catch (error) {
      onFlash({
        tone: "err",
        text: errorMessage(error, "İşlem tamamlanamadı, tekrar deneyin."),
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="member-listing">
      {listing.cover ? (
        <img
          src={listing.cover}
          alt={`${listing.title} kapak fotoğrafı`}
          loading="lazy"
        />
      ) : (
        <div className="member-thumb member-thumb-empty">Foto yok</div>
      )}

      <div className="member-listing-body">
        <div className="member-listing-top">
          <span className={`member-badge ${status.className}`}>
            <span aria-hidden="true">{status.icon}</span>
            {status.label}
          </span>
          <span className="member-inline">
            {formatNumber(listing.views ?? 0)} görüntülenme
          </span>
          <span className="member-inline">
            {CATEGORY_LABEL[listing.category] ?? listing.category}
          </span>
        </div>

        <h3>{listing.title}</h3>
        <p className="member-meta">
          {listing.sector}
          {listing.city ? ` · ${listing.city}` : ""} ·{" "}
          {formatDate(listing.createdAt)}
        </p>
        <p className="member-price">{formatPrice(listing)}</p>

        {listing.status === "rejected" && listing.rejectionReason && (
          <p className="member-reject">
            Editör notu: {listing.rejectionReason}
          </p>
        )}

        <div className="member-actions member-actions-tight">
          {listing.status === "approved" && (
            <a className="member-btn" href={listingHref(listing)}>
              İlanı gör
            </a>
          )}
          <a
            className="member-btn"
            href={`${href("/ilan-ver/")}?duzenle=${listing._id}`}
          >
            Düzenle
          </a>

          {listing.status !== "sold" && listing.status !== "expired" && (
            <button
              type="button"
              className="member-btn"
              disabled={busy !== null}
              onClick={() =>
                void run(
                  "sold",
                  () => markSold({ listingId: listing._id }),
                  "İlan satıldı olarak işaretlendi.",
                )
              }
            >
              {busy === "sold" ? "Kaydediliyor…" : "Satıldı işaretle"}
            </button>
          )}

          {(listing.status === "sold" || listing.status === "expired") && (
            <button
              type="button"
              className="member-btn"
              disabled={busy !== null}
              onClick={() =>
                void run(
                  "relist",
                  () => relist({ listingId: listing._id }),
                  "İlan yeniden onaya gönderildi.",
                )
              }
            >
              {busy === "relist" ? "Gönderiliyor…" : "Yeniden yayınla"}
            </button>
          )}

          <button
            type="button"
            className="member-btn danger"
            disabled={busy !== null}
            onClick={() => {
              if (!window.confirm("İlan kalıcı olarak silinsin mi?")) return;
              void run(
                "remove",
                () => remove({ listingId: listing._id }),
                "İlan silindi.",
              );
            }}
          >
            {busy === "remove" ? "Siliniyor…" : "Sil"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ModerationQueue({
  rows,
  onFlash,
}: {
  rows: ManagedListing[] | undefined;
  onFlash: (flash: Flash) => void;
}) {
  const approve = useMutation(api.listings.approve);
  const reject = useMutation(api.listings.reject);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function handle(listingId: string, approveIt: boolean) {
    setBusy(`${listingId}:${approveIt ? "ok" : "no"}`);
    try {
      if (approveIt) {
        await approve({ listingId });
        onFlash({ tone: "ok", text: "İlan yayına alındı." });
      } else {
        await reject({
          listingId,
          reason:
            reasons[listingId]?.trim() || "İlan kurallarına uymuyor.",
        });
        onFlash({ tone: "ok", text: "İlan reddedildi." });
      }
    } catch (error) {
      onFlash({
        tone: "err",
        text: errorMessage(error, "İşlem tamamlanamadı, tekrar deneyin."),
      });
    } finally {
      setBusy(null);
    }
  }

  if (rows === undefined) {
    return (
      <div className="member-card">
        <p className="member-note">Onay kuyruğu yükleniyor…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="member-empty">
        <h2>Onay bekleyen ilan yok.</h2>
        <p className="member-note">
          Yeni ilanlar geldiğinde burada listelenir; onayladığınız ilan aynı gün
          yayına girer.
        </p>
      </div>
    );
  }

  return (
    <div className="member-list">
      {rows.map((listing) => (
        <article key={listing._id} className="member-listing moderation">
          {listing.cover ? (
            <img
              src={listing.cover}
              alt={`${listing.title} kapak fotoğrafı`}
              loading="lazy"
            />
          ) : (
            <div className="member-thumb member-thumb-empty">Foto yok</div>
          )}

          <div className="member-listing-body">
            <div className="member-listing-top">
              <span className="member-badge pending">
                <span aria-hidden="true">◷</span> Onay bekliyor
              </span>
              <span className="member-inline">
                {CATEGORY_LABEL[listing.category] ?? listing.category}
              </span>
              <span className="member-inline">{formatDate(listing.createdAt)}</span>
            </div>

            <h3>{listing.title}</h3>
            <p className="member-meta">
              {listing.sector}
              {listing.city ? ` · ${listing.city}` : ""} ·{" "}
              {listing.contactName} · {listing.contactPhone}
            </p>
            <p className="member-description">{listing.description}</p>

            <div className="member-moderation">
              <label className="member-field member-field-inline">
                <span>Red gerekçesi (isteğe bağlı)</span>
                <input
                  value={reasons[listing._id] ?? ""}
                  onChange={(event) =>
                    setReasons((current) => ({
                      ...current,
                      [listing._id]: event.target.value,
                    }))
                  }
                  placeholder="Eksik künye, uygunsuz fotoğraf…"
                />
              </label>
              <div className="member-actions member-actions-tight">
                <button
                  type="button"
                  className="member-btn approve"
                  disabled={busy !== null}
                  onClick={() => void handle(listing._id, true)}
                >
                  {busy === `${listing._id}:ok` ? "Onaylanıyor…" : "Onayla"}
                </button>
                <button
                  type="button"
                  className="member-btn danger"
                  disabled={busy !== null}
                  onClick={() => void handle(listing._id, false)}
                >
                  {busy === `${listing._id}:no` ? "Reddediliyor…" : "Reddet"}
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
