import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  api,
  href,
  loginHref,
  type MemberUser,
} from "../../lib/member";

/**
 * Site üye ekranlarının ortak oturum katmanı.
 *
 * Her Astro adası kendi Convex istemcisini kurar; Convex Auth oturumu
 * tarayıcıda saklandığı için `/hesap/`, `/hesabim/` ve `/ilan-ver/`
 * birbirinden bağımsız adalar olsa da aynı hesabı görür.
 */

interface SessionValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: MemberUser | null;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser) as
    | MemberUser
    | null
    | undefined;
  const { signOut } = useAuthActions();

  const value = useMemo<SessionValue>(
    () => ({
      isLoading:
        authLoading || (isAuthenticated && user === undefined),
      isAuthenticated,
      user: user ?? null,
      signOut: async () => {
        await signOut();
        window.location.assign(href("/"));
      },
    }),
    [authLoading, isAuthenticated, signOut, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function MemberProvider({
  convexUrl,
  children,
}: {
  convexUrl: string;
  children: ReactNode;
}) {
  const client = useMemo(
    () => new ConvexReactClient(convexUrl),
    [convexUrl],
  );

  return (
    <ConvexAuthProvider client={client}>
      <SessionProvider>{children}</SessionProvider>
    </ConvexAuthProvider>
  );
}

export function useMember(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useMember yalnızca MemberProvider içinde kullanılabilir.");
  }
  return value;
}

/**
 * Giriş yapılmamışsa sayfanın içeriğini göstermez; bunun yerine site
 * tasarımıyla giriş çağrısı verir. Girişten sonra aynı sayfaya döner.
 */
export function MemberGate({
  children,
  title = "Devam etmek için giriş yapın",
  description = "İlan vermek ve ilanlarınızı yönetmek için Makine Nabzı hesabınızla giriş yapın.",
  showGuestActions = true,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  showGuestActions?: boolean;
}) {
  const { isLoading, isAuthenticated } = useMember();

  if (isLoading) {
    return (
      <div className="member-card">
        <p className="member-note">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="member-card member-gate">
        <span className="eyebrow">Üyelik</span>
        <h2>{title}</h2>
        <p className="member-note">{description}</p>
        <div className="member-actions" style={{ marginTop: 18 }}>
          <a className="button primary" href={loginHref()}>
            Giriş yap / Üye ol
          </a>
          {showGuestActions && (
            <a className="button ghost" href={href("/ilanlar/")}>
              İlanlara göz at
            </a>
          )}
        </div>
        <p className="member-fine" style={{ marginTop: 14 }}>
          Google veya e-posta koduyla şifresiz giriş. Aynı hesap Android
          uygulamasında da geçerlidir.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/** İlan verme yetkisi: anonim hesaplar ve doğrulanmamış e-postalar engellenir. */
export function canPublish(user: MemberUser | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return !user.isAnonymous && Boolean(user.emailVerificationTime);
}
