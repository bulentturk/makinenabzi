import { BrandMark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, BellRing, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (submitError) {
      console.error("Email sign-in error:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (submitError) {
      console.error("OTP verification error:", submitError);
      setError("Girdiğiniz doğrulama kodu geçersiz.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (guestError) {
      console.error("Guest login error:", guestError);
      setError(
        `Misafir girişi yapılamadı: ${
          guestError instanceof Error ? guestError.message : "Bilinmeyen hata"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-tint">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[26rem]">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Ana sayfaya dön"
            >
              <BrandMark className="size-11 rounded-2xl" iconClassName="size-6" />
            </button>
            <p className="font-display text-[0.95rem] font-semibold tracking-tight">
              Makine Nabzı
            </p>
          </div>

          <Card className="gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-lift">
            {step === "signIn" ? (
              <>
                <CardHeader className="pt-6 text-center">
                  <CardTitle className="font-display text-lg">
                    Giriş yapın veya hesap oluşturun
                  </CardTitle>
                  <CardDescription className="text-[0.82rem]">
                    E-posta adresinize tek kullanımlık kod gönderiyoruz; şifre
                    gerekmez.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="pt-5">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="ad@sirket.com"
                          type="email"
                          className="h-10 rounded-xl pl-9 text-[0.85rem]"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        className="size-10 rounded-xl"
                        disabled={isLoading}
                        aria-label="Kod gönder"
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                      </Button>
                    </div>

                    {error && (
                      <p className="mt-2.5 text-[0.78rem] text-destructive">
                        {error}
                      </p>
                    )}

                    <div className="mt-5">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/70" />
                        </div>
                        <div className="relative flex justify-center text-[0.68rem] font-medium tracking-wide uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            veya
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-10 w-full rounded-xl text-[0.84rem]"
                        onClick={() => void handleGuestLogin()}
                        disabled={isLoading}
                      >
                        <UserX className="size-4" />
                        Misafir olarak devam et
                      </Button>
                    </div>

                    <p className="mt-5 flex items-start gap-2 rounded-xl bg-surface-tint px-3 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                      <BellRing className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      Giriş yaptıktan sonra kategorilerinizi seçip bildirim
                      tercihlerinizi tek ekrandan ayarlayabilirsiniz.
                    </p>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="pt-6 text-center">
                  <CardTitle className="font-display text-lg">
                    E-postanızı kontrol edin
                  </CardTitle>
                  <CardDescription className="text-[0.82rem]">
                    {step.email} adresine altı haneli bir kod gönderdik.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pt-5 pb-6">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (event.target as HTMLElement).closest(
                              "form",
                            );
                            form?.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="mt-3 text-center text-[0.78rem] text-destructive">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="mt-5 h-10 w-full rounded-xl text-[0.85rem]"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Doğrulanıyor…
                        </>
                      ) : (
                        <>
                          Kodu doğrula
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>

                    <div className="mt-3 flex items-center justify-center gap-1 text-[0.78rem] text-muted-foreground">
                      Kod gelmedi mi?
                      <button
                        type="button"
                        className="font-semibold text-primary hover:underline"
                        onClick={() => {
                          setStep("signIn");
                          setOtp("");
                          setError(null);
                        }}
                      >
                        Tekrar dene
                      </button>
                    </div>
                  </CardContent>
                </form>
              </>
            )}
          </Card>

          <p className="mt-6 text-center text-[0.75rem] leading-relaxed text-muted-foreground">
            Devam ederek makinenabzi.com haber akışının size bildirim
            göndermesine izin vermiş olursunuz. Tercihlerinizi istediğiniz an
            ayarlardan değiştirebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
