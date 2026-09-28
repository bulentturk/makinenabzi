import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Anchor, BatteryCharging, Signal, Truck, Wifi } from "lucide-react";

/** Real, recently published makinenabzi.com stories. */
const BANNERS = [
  {
    title: "John Deere 40 P-Tier kompakt ekskavatörünü tanıttı",
    body: "10.000 lb'nin altında işletme ağırlığı bildiriliyor.",
    tint: "text-amber-600",
    icon: Truck,
    time: "şimdi",
  },
  {
    title: "Geely, 2,25 MW şarj sistemiyle yüksek güç yarışına katılıyor",
    body: "Yüzde 10'dan 70'e şarj süresi 4,5 dakika.",
    tint: "text-teal-600",
    icon: BatteryCharging,
    time: "12 dk",
  },
];

const FEED = [
  {
    label: "İş Makinaları",
    tint: "bg-amber-500/12 text-amber-700",
    title: "Advance, 20 bininci önden boşaltmalı mikserini üretti",
    meta: "1 dk okuma",
  },
  {
    label: "Liman & Elleçleme",
    tint: "bg-cyan-500/12 text-cyan-700",
    title: "Taylor Machine Works reach stacker serisini genişletti",
    meta: "1 dk okuma",
  },
  {
    label: "Madencilik",
    tint: "bg-stone-500/12 text-stone-700",
    title: "Titan International, ITM alt takım işini USCO'ya satıyor",
    meta: "2 dk okuma",
  },
];

export function PhonePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem]">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-full bg-signal/25 blur-3xl"
      />

      <div className="relative rounded-[2.75rem] border border-border/70 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.02] p-2 shadow-lift">
        <div className="relative overflow-hidden rounded-[2.3rem] border border-border/70 bg-background">
          <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[0.6rem] font-semibold text-muted-foreground">
            <span>09:41</span>
            <span className="flex items-center gap-1">
              <Signal className="size-3" />
              <Wifi className="size-3" />
              <span className="ml-0.5 inline-block h-2 w-4 rounded-[0.2rem] border border-muted-foreground/60" />
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 pt-1.5 pb-3">
            <img
              src="/brand-mark.svg"
              alt=""
              className="size-7 shrink-0 rounded-lg"
            />
            <div className="leading-none">
              <p className="font-display text-[0.78rem] font-semibold tracking-tight">
                MAKİNE NABZI
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[0.58rem] font-medium text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-signal" />
                yayın akışı canlı
              </p>
            </div>
          </div>

          <div className="space-y-2 px-3">
            {BANNERS.map((banner, index) => {
              const Icon = banner.icon;
              return (
                <motion.div
                  key={banner.title}
                  initial={{ opacity: 0, y: -14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.5,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-2xl border border-border/70 bg-card/95 p-2.5 shadow-soft backdrop-blur"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[0.35rem] bg-secondary",
                        banner.tint,
                      )}
                    >
                      <Icon className="size-2.5" strokeWidth={2.6} />
                    </span>
                    <span className="text-[0.55rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                      Makine Nabzı
                    </span>
                    <span className="ml-auto text-[0.55rem] text-muted-foreground">
                      {banner.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.7rem] leading-snug font-semibold">
                    {banner.title}
                  </p>
                  <p className="mt-0.5 text-[0.62rem] leading-snug text-muted-foreground">
                    {banner.body}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 space-y-2 rounded-t-2xl border-t border-border/60 bg-surface-tint px-3 pt-3 pb-5">
            <div className="flex items-center gap-1.5 px-0.5">
              <Anchor className="size-3 text-muted-foreground" />
              <span className="text-[0.55rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                Sektör akışı
              </span>
            </div>
            {FEED.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/60 bg-card p-2.5 shadow-soft"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.52rem] font-bold tracking-wide",
                      item.tint,
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="ml-auto text-[0.55rem] text-muted-foreground">
                    {item.meta}
                  </span>
                </div>
                <p className="mt-1.5 text-[0.68rem] leading-snug font-semibold">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
