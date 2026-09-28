import { cn } from "@/lib/utils";
import { Download, Share2, Smartphone, SquareArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function InstallGuide({ className }: { className?: string }) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [platform] = useState(detectPlatform);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="size-4" />
        </span>
        <div>
          <p className="font-display text-[0.9rem] font-semibold">
            Uygulamayı cihazınıza kurun
          </p>
          <p className="mt-0.5 text-[0.76rem] text-muted-foreground">
            Kurulduğunda tam ekran açılır ve bildirimler uygulama gibi çalışır.
          </p>
        </div>
      </div>

      {installed ? (
        <p className="mt-3 rounded-xl bg-emerald-500/[0.08] px-3 py-2.5 text-[0.78rem] font-medium text-emerald-700">
          Bu cihazda kurulu sürümden görüntülüyorsunuz.
        </p>
      ) : installEvent ? (
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.82rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="size-4" />
          Uygulamayı yükle
        </button>
      ) : (
        <ol className="mt-3 space-y-2.5">
          <li className="flex gap-2.5 text-[0.78rem] leading-relaxed text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.68rem] font-semibold text-foreground">
              1
            </span>
            {platform === "ios"
              ? "Safari'de alttaki Paylaş simgesine dokunun."
              : "Tarayıcı menüsünü (⋮) açın."}
            {platform === "ios" && (
              <Share2 className="mt-0.5 size-3.5 shrink-0 text-foreground" />
            )}
          </li>
          <li className="flex gap-2.5 text-[0.78rem] leading-relaxed text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.68rem] font-semibold text-foreground">
              2
            </span>
            <span className="flex items-center gap-1.5">
              <SquareArrowDown className="size-3.5 shrink-0" />
              {platform === "ios"
                ? "“Ana Ekrana Ekle” seçeneğini seçin."
                : "“Ana ekrana ekle / Uygulamayı yükle” seçeneğini seçin."}
            </span>
          </li>
          <li className="flex gap-2.5 text-[0.78rem] leading-relaxed text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.68rem] font-semibold text-foreground">
              3
            </span>
            Uygulamayı açıp bildirim iznini onaylayın.
          </li>
        </ol>
      )}

      <p className="mt-3 border-t border-border/60 pt-3 text-[0.72rem] leading-relaxed text-muted-foreground">
        Mağaza sürümleri için not: aynı arayüz Capacitor veya React Native
        kabuğuyla Android (APK/AAB) ve iOS (IPA) olarak paketlenebilir. Mağaza
        derlemeleri ayrı bir native build hattı ve Apple/Google hesapları
        gerektirir; bu sürüm o hattın hazır arayüzüdür.
      </p>
    </section>
  );
}
