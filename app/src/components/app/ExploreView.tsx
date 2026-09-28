import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileStack,
  Library,
  Newspaper,
  Radio,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { FairsView } from "./FairsView";
import { SourcesView } from "./SourcesView";

type Segment = "fuarlar" | "kaynaklar" | "akis";

const SEGMENTS: ReadonlyArray<{ id: Segment; label: string; icon: LucideIcon }> = [
  { id: "fuarlar", label: "Fuarlar", icon: CalendarDays },
  { id: "kaynaklar", label: "Kaynaklar", icon: Library },
  { id: "akis", label: "Akışlar", icon: Newspaper },
];

/**
 * The editorial streams the newsroom publishes into, mirrored from
 * `src/pages/haberler.astro` so the app never invents its own taxonomy.
 */
const STREAMS: ReadonlyArray<[string, string]> = [
  ["OEM & Ürün", "Yeni ürünler, ürün gamı genişletmeleri ve üretici duyuruları."],
  ["Yatırım & İş Birliği", "Tesis yatırımları, satın almalar, niyet mektupları ve teknoloji ortaklıkları."],
  ["Regülasyon & Güvenlik", "Emisyon, emniyet, saha güvenliği ve sektörel düzenlemeler."],
  ["Dijitalleşme", "Otonomi, telemetri, kestirimci bakım, bağlantılı makine ve yazılım ekosistemi."],
  ["Pazar & Veri", "Üretim, ihracat, satış ve bölgesel pazar hareketleri."],
  ["Saha", "Fuarlar, kullanıcı gözlemleri, birlikler, kooperatifler ve uygulama örnekleri."],
];

/** Editorial formats from the newsroom's platform taxonomy. */
const FORMATS: ReadonlyArray<[string, string]> = [
  ["Haber", "Doğrulanmış sektör ve teknoloji gelişmeleri"],
  ["Teknik İnceleme", "Bileşen ve sistem seviyesinde mühendislik analizi"],
  ["Makine Dosyası", "Makine sınıfı, üreticiler, özellikler ve kullanım alanları"],
  ["Teknoloji Radar", "Yükselen teknoloji, prototip ve Ar-Ge yönleri"],
  ["Karşılaştırma", "Teknik özellik ve mimari karşılaştırmaları"],
  ["Saha Rehberi", "Bakım, arıza belirtisi, seçim ve uygulama pratikleri"],
  ["Pazar & Veri", "Üretim, ihracat, satış ve yatırım göstergeleri"],
  ["Fuar & Etkinlik", "Takvim, lansmanlar ve etkinlik sonrası teknik özet"],
];

function StreamsView({
  onSearchArticles,
}: {
  onSearchArticles: (term: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-[0.68rem] font-semibold text-primary">
          <Radio className="size-3" />
          Günlük yayın ekseni
        </span>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
          Haber akışları
        </h1>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          Takip ettiğimiz alanlar. Bir akışa dokunarak yayımlanmış haberleri
          arayın; sonuçlar doğrudan akış sekmesinde açılır.
        </p>
      </div>

      <div className="space-y-2">
        {STREAMS.map(([title, description]) => (
          <button
            key={title}
            type="button"
            onClick={() => onSearchArticles(title.split(" & ")[0])}
            className="w-full rounded-xl border border-border/60 bg-card px-3.5 py-3 text-left transition-colors hover:border-border hover:bg-secondary/50"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 text-primary" />
              <span className="text-[0.86rem] font-semibold">{title}</span>
            </div>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2 px-1">
          <h2 className="font-display text-base font-semibold tracking-tight">
            İçerik tipleri
          </h2>
          <span className="text-[0.72rem] text-muted-foreground">
            {FORMATS.length} format
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORMATS.map(([title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <FileStack className="size-3.5 text-muted-foreground" />
                <span className="text-[0.8rem] font-semibold">{title}</span>
              </div>
              <p className="mt-0.5 text-[0.72rem] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExploreView({
  onSearchArticles,
}: {
  onSearchArticles: (term: string) => void;
}) {
  const [segment, setSegment] = useState<Segment>("fuarlar");

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Keşfet bölümleri"
        className="flex gap-1 rounded-xl border border-border/70 bg-secondary/60 p-1"
      >
        {SEGMENTS.map((item) => {
          const Icon = item.icon;
          const active = segment === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSegment(item.id)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[0.76rem] font-semibold transition-colors",
                active
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {segment === "fuarlar" && <FairsView onSearchArticles={onSearchArticles} />}
      {segment === "kaynaklar" && (
        <SourcesView onSearchArticles={onSearchArticles} />
      )}
      {segment === "akis" && <StreamsView onSearchArticles={onSearchArticles} />}
    </div>
  );
}
