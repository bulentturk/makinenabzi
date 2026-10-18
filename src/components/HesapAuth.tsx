import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { useMemo, useState, type FormEvent } from "react";

/**
 * Sitenin kendi tasarımıyla çalışan giriş formu.
 *
 * Üye alanının tamamı `/app/` altındaki React uygulamasında; bu ada yalnızca
 * hesap açma/giriş adımını sitede tutar. Convex Auth oturumu alan adı
 * üzerinden paylaşıldığı için burada giriş yapan kullanıcı `/app/` içinde de
 * giriş yapmış olur.
 */

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" width="17" height="17">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.9l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function HesapForm() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<null | "google" | "email" | "code">(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setBusy("google");
    try {
      await signIn("google");
    } catch {
      setError("Google ile giriş başlatılamadı. Birazdan tekrar deneyin.");
      setBusy(null);
    }
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy("email");
    try {
      const form = new FormData();
      form.set("email", email.trim());
      await signIn("email-otp", form);
      setStep("code");
    } catch {
      setError(
        "Giriş kodu gönderilemedi. E-posta adresinizi kontrol edip tekrar deneyin.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy("code");
    try {
      const form = new FormData();
      form.set("email", email.trim());
      form.set("code", code.trim());
      await signIn("email-otp", form);
    } catch {
      setError("Kod geçersiz. Yeni kod isteyip tekrar deneyin.");
      setCode("");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) {
    return <p className="hesap-note">Oturum kontrol ediliyor…</p>;
  }

  if (isAuthenticated) {
    return (
      <div className="hesap-card">
        <h2>Hesabınız açık.</h2>
        <p className="hesap-note">
          İlan verebilir, ilanlarınızı yönetebilir ve favorilerinizi
          görebilirsiniz.
        </p>
        <div className="hesap-actions">
          <a className="button primary" href="/app/dashboard/">
            Hesabıma git
          </a>
          <a className="button ghost" href="/ilan-ver/">
            İlan ver
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="hesap-card">
      {step === "email" ? (
        <>
          <h2>Üye ol veya giriş yap</h2>
          <p className="hesap-note">
            Tek tıkla Google ile devam edin ya da e-posta adresinize gönderilen
            altı haneli kodla giriş yapın. Şifre yok.
          </p>

          <div className="hesap-actions">
            <button
              type="button"
              className="button ghost hesap-google"
              onClick={() => void handleGoogle()}
              disabled={busy !== null}
            >
              <GoogleMark />
              {busy === "google" ? "Google'a yönlendiriliyor…" : "Google ile devam et"}
            </button>
          </div>

          <div className="hesap-divider"><span>veya</span></div>

          <form onSubmit={handleEmail}>
            <div className="hesap-field">
              <label htmlFor="hesap-email">E-posta</label>
              <input
                id="hesap-email"
                type="email"
                required
                autoComplete="email"
                placeholder="ad@sirket.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy !== null}
              />
            </div>
            <div className="hesap-actions">
              <button
                type="submit"
                className="button primary"
                disabled={busy !== null}
              >
                {busy === "email" ? "Kod gönderiliyor…" : "Kod gönder"}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h2>Kodu girin</h2>
          <p className="hesap-note">
            <strong>{email}</strong> adresine altı haneli kod gönderildi. Kod 15
            dakika geçerli.
          </p>
          <form onSubmit={handleCode}>
            <div className="hesap-field">
              <label htmlFor="hesap-code">Doğrulama kodu</label>
              <input
                id="hesap-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="000000"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={busy !== null}
              />
            </div>
            <div className="hesap-actions">
              <button
                type="submit"
                className="button primary"
                disabled={busy !== null || code.length !== 6}
              >
                {busy === "code" ? "Doğrulanıyor…" : "Giriş yap"}
              </button>
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                disabled={busy !== null}
              >
                E-postayı değiştir
              </button>
            </div>
          </form>
        </>
      )}

      {error && <p className="hesap-error">{error}</p>}

      <p className="hesap-note hesap-fine">
        Devam ederek kullanım koşullarını ve{" "}
        <a href="/gizlilik/">gizlilik politikasını</a> kabul etmiş olursunuz.
      </p>
    </div>
  );
}

export default function HesapAuth({ convexUrl }: { convexUrl: string }) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);
  return (
    <ConvexAuthProvider client={client}>
      <HesapForm />
    </ConvexAuthProvider>
  );
}
