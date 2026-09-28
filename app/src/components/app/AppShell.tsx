import { BrandLockup, BrandMark } from "@/components/Brand";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bookmark,
  Compass,
  Newspaper,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export type AppTab =
  | "akis"
  | "kesfet"
  | "bildirimler"
  | "kaydedilenler"
  | "ayarlar";

const TABS: ReadonlyArray<{ id: AppTab; label: string; icon: LucideIcon }> = [
  { id: "akis", label: "Akış", icon: Newspaper },
  { id: "kesfet", label: "Keşfet", icon: Compass },
  { id: "bildirimler", label: "Bildirimler", icon: Bell },
  { id: "kaydedilenler", label: "Kaydedilen", icon: Bookmark },
  { id: "ayarlar", label: "Ayarlar", icon: Settings },
];

export function AppShell({
  tab,
  onTabChange,
  unreadCount,
  children,
}: {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  unreadCount: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-tint">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-0 lg:px-6">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col py-8 lg:flex">
          <BrandLockup />

          <nav className="mt-8 flex flex-col gap-1">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] font-medium transition-colors",
                    active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={2.2}
                  />
                  {item.label}
                  {item.id === "bildirimler" && unreadCount > 0 && (
                    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[0.68rem] font-semibold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <p className="text-[0.75rem] font-semibold">Akış canlı</p>
            </div>
            <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
              Yeni haberler yayına girdiği an bildirim olarak iletilir.
            </p>
          </div>
        </aside>

        <div className="relative flex min-h-screen w-full flex-col bg-background lg:my-6 lg:min-h-[calc(100vh-3rem)] lg:max-w-2xl lg:rounded-3xl lg:border lg:border-border/70 lg:shadow-soft">
          <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 lg:hidden">
            <BrandMark className="size-8" />
            <span className="font-display text-[0.95rem] font-semibold tracking-tight">
              Makine Nabzı
            </span>
            <button
              type="button"
              onClick={() => onTabChange("bildirimler")}
              aria-label="Bildirimler"
              className="relative ml-auto inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Bell className="size-5" strokeWidth={2.2} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-pulse text-[0.6rem] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </header>

          <main className="flex-1 px-4 pt-5 pb-28 lg:pb-10">{children}</main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[0.66rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                  {item.id === "bildirimler" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full bg-pulse text-[0.6rem] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
