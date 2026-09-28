import { BrandLockup, BrandMark } from "@/components/Brand";
import { InstallGuide } from "@/components/app/InstallGuide";
import { PhonePreview } from "@/components/landing/PhonePreview";
import { FairsTeaser, SourcesTeaser } from "@/components/landing/SiteStructure";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SECTORS } from "@/lib/news";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Bookmark,
  Check,
  ExternalLink,
  Flame,
  ListChecks,
  MoonStar,
  Search,
  ShieldCheck,
  Smartphone,
  ShoppingCart,
  Sparkles,
  Truck,
  UserCog,
  Waypoints,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

const DASHBOARD_PATH = "/dashboard";
const START_HREF = `/auth?returnTo=${encodeURIComponent(DASHBOARD_PATH)}`;

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const NAV_LINKS = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#bildirimler", label: "Bildirimler" },
  { href: "#sektorler", label: "Sektörler" },
  { href: "#fuarlar", label: "Fuarlar" },
  { href: "#kaynaklar", label: "Kaynaklar" },
  { href: "#kurulum", label: "Kurulum" },
];

function SiteHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <BrandLockup />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[0.84rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild size="sm" className="h-9 rounded-xl px-4">
              <Link to={DASHBOARD_PATH}>
                Uygulamaya git
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden h-9 rounded-xl px-3.5 text-muted-foreground sm:inline-flex"
              >
                <Link to={START_HREF}>Giriş yap</Link>
              </Button>
              <Button asChild size="sm" className="h-9 rounded-xl px-4">
                <Link to={START_HREF}>Ücretsiz başla</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const HERO_STATS = [
  { value: "Kaynaklı", label: "her haber orijinal kaynağıyla yayınlanır" },
  { value: "Editoryal", label: "yayın öncesi teknik onay" },
  { value: "Anlık", label: "yayına girdiği an bildirim" },
];

const TOPICS = [
  "iş makinaları",
  "madencilik",
  "liman ekipmanları",
  "tarım makineleri",
  "araç üstü ekipman",
  "elektrifikasyon",
  "batarya",
  "şarj altyapısı",
  "alt takım",
  "fuar takvimi",
  "teknik analiz",
  "kaynak dizini",
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.42_0.055_225/0.12),transparent_70%)]"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[0.72rem] font-semibold text-primary"
          >
            <Sparkles className="size-3.5" />
            makinenabzi.com mobil uygulaması
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-[2.35rem] leading-[1.08] font-semibold text-balance sm:text-[3rem] lg:text-[3.35rem]"
          >
            Makinenin nabzı,
            <span className="block bg-gradient-to-r from-primary to-[oklch(0.72_0.11_210)] bg-clip-text text-transparent">
              cebinizde.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground"
          >
            İş makinaları, madencilik, liman, tarım, araç üstü ekipman ve
            elektrifikasyondaki gelişmeler; kaynak gösterilerek ve editoryal
            onaydan geçerek yayınlanır. Sektörünüzü seçin, yeni bir gelişme
            yayına girdiği an bildirimi alın.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              asChild
              size="lg"
              className="h-11 rounded-xl px-6 text-[0.9rem]"
            >
              <Link to={START_HREF}>
                Ücretsiz başla
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-xl border-border/80 px-6 text-[0.9rem]"
            >
              <a href="#bildirimler">Nasıl çalışır?</a>
            </Button>
          </motion.div>

          <p className="mt-4 text-[0.78rem] text-muted-foreground">
            Web uygulaması olarak çalışır; iOS ve Android&apos;de ana ekrana
            eklenip uygulama gibi tam ekran açılır.
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.value}>
                <dt className="font-display text-lg font-semibold tracking-tight">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[0.74rem] leading-snug text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhonePreview />
        </motion.div>
      </div>
    </section>
  );
}

function TopicStrip() {
  return (
    <section className="border-y border-border/60 bg-surface-tint">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
        <p className="shrink-0 text-[0.72rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Akışta neler var
        </p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border/70 bg-background px-3 py-1 text-[0.76rem] font-medium text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: BellRing,
    title: "Sektör bazlı bildirim",
    body: "İş makinaları, madencilik, liman, tarım, üstyapı veya elektrifikasyon: yalnızca ilgilendiğiniz başlıklarda bildirim alın.",
  },
  {
    icon: Flame,
    title: "Son dakika hattı",
    body: "Editör masasının son dakika işaretlediği haberler akışın tepesine çıkar ve anında iletilir.",
  },
  {
    icon: ListChecks,
    title: "Öne çıkan bilgiler",
    body: "Her haberde öne çıkan bilgiler listesi ve Makine Nabzı yorumu birlikte gelir; teknik bağlam kaybolmaz.",
  },
  {
    icon: ShieldCheck,
    title: "Kaynak şeffaflığı",
    body: "Haberin orijinal kaynağı ve yayın tarihi her zaman görünür; tek dokunuşla kaynağa gidin.",
  },
  {
    icon: Bookmark,
    title: "Kaydet, sonra oku",
    body: "Şantiyede ya da fuar arasında göz attığınız haberleri kaydedin, müsait olduğunuzda detaylı okuyun.",
  },
  {
    icon: Search,
    title: "Model ve marka araması",
    body: "“Ekskavatör”, “alt takım”, “batarya” ya da bir marka adı yazın; akış anında filtrelenir.",
  },
];

function Features() {
  return (
    <section id="ozellikler" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Özellikler
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Yayını takip etmek için sade bir kontrol paneli
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Fazla bilgi değil, doğru bilgi. Akış, kaydedilenler ve bildirim
            kuralları tek ekranda toplanır.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                {...reveal}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 ring-inset transition-colors group-hover:bg-primary/12">
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 font-display text-[1rem] font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const DELIVERY_STEPS = [
  {
    title: "Sektörlerinizi seçin",
    body: "İş makinaları, madencilik, liman, tarım, üstyapı, elektrifikasyon, yatırım ya da teknoloji. Yalnızca seçtiğiniz başlıklar bildirim olur.",
  },
  {
    title: "Sıklığı ve sessiz saatleri belirleyin",
    body: "Anında, günlük özet ya da haftalık bülten. Gece 23:00–07:00 arasında acil olmayan bildirimler ertelenir.",
  },
  {
    title: "Bildirim cebinize düşsün",
    body: "Özet bildirime dokununca haber tam metin, öne çıkan bilgiler ve yorumuyla açılır; dilerseniz kaydedip sonra okursunuz.",
  },
];

const RULE_ROWS = [
  { icon: BellRing, label: "Son dakika bildirimi", value: "Açık" },
  { icon: MoonStar, label: "Sessiz saatler", value: "23:00 – 07:00" },
  { icon: Waypoints, label: "Sektör filtresi", value: "4 sektör" },
  { icon: ListChecks, label: "Günlük özet", value: "08:00" },
];

function Delivery() {
  return (
    <section
      id="bildirimler"
      className="scroll-mt-20 border-y border-border/60 bg-surface-tint"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <motion.div {...reveal}>
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Bildirim akışı
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Yeni haber yayına girdiği an haberdar olun
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Bildirim göndermek kolay, doğru bildirimi göndermek zor. Uygulama
            her haberi değil, sizin seçtiğiniz sektörlerdeki gelişmeleri iletir.
          </p>

          <ol className="mt-9 space-y-6">
            {DELIVERY_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background font-display text-[0.8rem] font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-[0.95rem] font-semibold">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div {...reveal} className="relative">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-lift sm:p-6">
            <div className="flex items-center gap-2.5">
              <BrandMark className="size-8 rounded-lg" iconClassName="size-4" />
              <div>
                <p className="font-display text-[0.88rem] font-semibold">
                  Bildirim kuralları
                </p>
                <p className="text-[0.72rem] text-muted-foreground">
                  Hesabınıza özel · anında güncellenir
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-700">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                aktif
              </span>
            </div>

            <div className="mt-5 divide-y divide-border/60">
              {RULE_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-[0.83rem] font-medium">
                      {row.label}
                    </span>
                    <span className="ml-auto rounded-lg bg-secondary px-2 py-1 text-[0.72rem] font-semibold text-secondary-foreground">
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4">
              <div className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-[0.35rem] bg-card">
                  <Flame className="size-2.5 text-pulse" />
                </span>
                <span className="text-[0.58rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                  Makine Nabzı
                </span>
                <span className="ml-auto text-[0.58rem] text-muted-foreground">
                  şimdi
                </span>
              </div>
              <p className="mt-2 text-[0.85rem] leading-snug font-semibold">
                Taylor Machine Works, reach stacker serisini üç yüksek
                kapasiteli modelle genişletti
              </p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
                Bataryalı elektrikli ZRS-1272, XRS-1180 ve XRS-1190 ile bazı
                uygulamalarda 120.000 lb kapasite bildiriliyor.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[0.76rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" />
              Bildirim başına tek dokunuş
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" />
              İstediğiniz an kapatılabilir
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Sectors() {
  return (
    <section id="sektorler" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Sektörler
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Yayının tamamı, sektör sektör
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Her sektörün kendi bildirim kuralı olur. Yalnızca üstyapı ve liman
            ekipmanlarını takip ediyorsanız, diğer başlıkları kapatabilirsiniz.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={sector.label}
                {...reveal}
                transition={{
                  duration: 0.5,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                    sector.tint,
                  )}
                >
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="font-display text-[0.93rem] font-semibold">
                    {sector.label}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
                    {sector.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const PERSONAS = [
  {
    icon: UserCog,
    title: "Şantiye ve filo yöneticileri",
    body: "Yeni model, kapasite ve yatırım haberlerini gün içinde takip edin.",
  },
  {
    icon: Wrench,
    title: "Bakım-onarım ekipleri",
    body: "Alt takım, hidrolik ve elektrifikasyonla ilgili teknik gelişmeler.",
  },
  {
    icon: ShoppingCart,
    title: "Satın alma ve tedarik",
    body: "Tedarikçi değişiklikleri, satın almalar ve ekipman duyuruları.",
  },
  {
    icon: Truck,
    title: "Bayiler ve servis noktaları",
    body: "Servis, yedek parça ve saha desteği gündemindeki hareketler.",
  },
];

function Personas() {
  return (
    <section className="border-y border-border/60 bg-surface-tint">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Kimler için
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Sahada çalışan ekipler için tasarlandı
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <motion.div
                key={persona.title}
                {...reveal}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-2xl border border-border/70 bg-background p-5 shadow-soft"
              >
                <Icon className="size-5 text-primary" strokeWidth={2.2} />
                <p className="mt-4 font-display text-[0.93rem] leading-snug font-semibold">
                  {persona.title}
                </p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {persona.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Install() {
  return (
    <section id="kurulum" className="scroll-mt-20">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <motion.div {...reveal}>
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase">
            Kurulum
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight font-semibold text-balance sm:text-[2.15rem]">
            Uygulamayı telefonunuza ekleyin
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Makine Nabzı web uygulaması olarak çalışır ve ana ekrana eklendiğinde
            tam ekran, uygulama gibi açılır. Böylece iOS ve Android&apos;de mağaza
            güncellemesi beklemeden en güncel sürümü kullanırsınız.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
              <Smartphone className="size-5 text-primary" />
              <p className="mt-3 font-display text-[0.93rem] font-semibold">
                Android
              </p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
                Chrome menüsünden &ldquo;Uygulamayı yükle&rdquo; ile ana ekrana
                eklenir. Play Store derlemesi için APK/AAB paketi ayrı bir native
                build hattı gerektirir.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
              <Smartphone className="size-5 text-primary" />
              <p className="mt-3 font-display text-[0.93rem] font-semibold">
                iOS
              </p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
                Safari&apos;de Paylaş &rarr; &ldquo;Ana Ekrana Ekle&rdquo;. App
                Store sürümü için Apple Developer hesabıyla imzalı IPA derlemesi
                gerekir.
              </p>
            </div>
          </div>

          <p className="mt-6 text-[0.78rem] leading-relaxed text-muted-foreground">
            Mağaza sürümleri için aynı arayüz Capacitor veya React Native kabuğuyla
            paketlenir; bu sürüm o paketin birebir üretim arayüzüdür.
          </p>
        </motion.div>

        <motion.div {...reveal}>
          <InstallGuide />
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <motion.div
        {...reveal}
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[oklch(0.34_0.05_224)] to-[oklch(0.19_0.03_232)] px-6 py-14 text-center shadow-lift sm:px-12"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 -top-24 mx-auto h-56 w-56 rounded-full bg-[oklch(0.72_0.11_210)]/25 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.72rem] font-semibold text-white/90">
            <span className="size-1.5 animate-pulse rounded-full bg-pulse" />
            Bildirim hattı açık
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-[1.9rem] leading-tight font-semibold text-balance text-white sm:text-[2.3rem]">
            Sektörünüzü seçin, gerisini biz bildirelim
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
            Hesap oluşturun, sektörlerinizi işaretleyin ve makinenabzi.com
            yayınındaki ilk gelişmeyi cebinizde okuyun.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-xl bg-white px-6 text-[0.9rem] text-[oklch(0.24_0.04_228)] hover:bg-white/90 sm:w-auto"
            >
              <Link to={START_HREF}>
                Ücretsiz başla
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-11 w-full rounded-xl px-6 text-[0.9rem] text-white/85 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <a href="#ozellikler">Özellikleri gör</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const SITE_LINKS = [
  { href: "https://makinenabzi.com/haberler/", label: "Haberler" },
  { href: "https://makinenabzi.com/teknik-blog/", label: "Teknik Merkez" },
  { href: "https://makinenabzi.com/fuar-takvimi/", label: "Fuar Takvimi" },
  { href: "https://makinenabzi.com/kaynaklar/", label: "Kaynak Dizini" },
  { href: "https://makinenabzi.com/hakkimizda/", label: "Hakkımızda" },
];

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface-tint">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <BrandLockup />
          <p className="mt-4 text-[0.82rem] leading-relaxed text-muted-foreground">
            Mobil makine teknolojilerini haber, teknik analiz, saha bilgisi ve
            veriyle tek platformda buluşturan bağımsız yayının mobil uygulaması.
          </p>
          <p className="mt-3 text-[0.78rem] font-medium text-foreground/80">
            Makinenin kendisinden, onu mümkün kılan teknolojiye.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-[0.82rem] sm:grid-cols-3">
          <div>
            <p className="font-display text-[0.8rem] font-semibold">
              Uygulama
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-[0.8rem] font-semibold">Hesap</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link
                  to={START_HREF}
                  className="transition-colors hover:text-foreground"
                >
                  Giriş yap
                </Link>
              </li>
              <li>
                <Link
                  to={DASHBOARD_PATH}
                  className="transition-colors hover:text-foreground"
                >
                  Haber akışı
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-[0.8rem] font-semibold">
              makinenabzi.com
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ExternalLink className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-[0.75rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} makinenabzi.com · Makine Nabzı</p>
          <p>
            Haberler yayının kendi RSS akışından alınır ve editoryal onaydan
            geçmiş sürümleriyle gösterilir.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <TopicStrip />
        <Features />
        <Delivery />
        <Sectors />
        <FairsTeaser />
        <SourcesTeaser />
        <Personas />
        <Install />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
