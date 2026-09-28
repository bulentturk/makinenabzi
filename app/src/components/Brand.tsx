import { cn } from "@/lib/utils";

/**
 * The makinenabzi.com brand mark: a pulse trace in the newsroom's cyan with
 * the amber accent, exactly as it appears on the site.
 */
export function BrandMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] bg-[oklch(0.19_0.02_232)] ring-1 ring-[oklch(0.42_0.05_225)]/60",
        className,
      )}
    >
      <img
        src="/brand-mark.svg"
        alt=""
        className={cn("size-full object-cover", iconClassName)}
      />
    </span>
  );
}

export function BrandLockup({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={compact ? "size-8" : undefined} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.975rem] font-semibold tracking-tight">
          Makine Nabzı
        </span>
        {!compact && (
          <span className="mt-0.5 text-[0.62rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Mobil makine teknolojileri
          </span>
        )}
      </span>
    </span>
  );
}
