/**
 * Üretim giriş noktası — repoda `app/src/main.tsx` olarak yer alır.
 *
 * Bu dosya, çalışma ortamındaki `src/main.tsx` ile aynı uygulamayı başlatır;
 * farkı, yalnızca önizleme ortamına ait parçaların (Vly toolbar ve iframe rota
 * köprüsü) çıkarılmış olmasıdır. Onlar üretimde hem gereksiz hem de dışa bağımlı.
 */
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    </div>
  );
}

/**
 * Yapılandırma hatasını beyaz ekran yerine okunur bir mesajla gösterir.
 * En sık deploy hatası VITE_CONVEX_URL'in tanımsız olmasıdır.
 */
function ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-lg text-center">
        <p className="font-display text-sm font-semibold">
          Yapılandırma eksik
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <code className="rounded bg-secondary px-1 py-0.5">VITE_CONVEX_URL</code>{" "}
          tanımlı değil. Yayın ortamında bu değeri Convex dağıtımınızın adresiyle
          ayarlayın, ardından yeniden derleyin.
        </p>
      </div>
    </div>
  );
}

/** Beklenmedik bir hata olduğunda okuru boş sayfada bırakmaz. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Bilinmeyen hata" };
  }

  componentDidCatch(error: Error) {
    console.error("[Makine Nabzı] Uygulama hatası:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-lg text-center">
          <p className="font-display text-sm font-semibold">
            Bir şeyler ters gitti
          </p>
          <p className="mt-2 text-xs break-words text-muted-foreground">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Yeniden dene
          </button>
        </div>
      </div>
    );
  }
}

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      {convex ? (
        <ConvexAuthProvider client={convex}>
          <BrowserRouter>
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/auth"
                  element={<AuthPage redirectAfterAuth="/dashboard" />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </ConvexAuthProvider>
      ) : (
        <ConfigError />
      )}
    </RootErrorBoundary>
  </StrictMode>,
);
