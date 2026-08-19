import { cn } from "@/lib/utils";

const SIZES = {
  sm: { chip: "h-6 w-6 rounded-md", icon: "h-3.5 w-3.5", text: "text-sm" },
  md: { chip: "h-7 w-7 rounded-lg", icon: "h-4 w-4", text: "text-lg" },
} as const;

export function Logo({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];

  return (
    <span className={cn("flex items-center gap-2 font-heading font-bold tracking-tight", s.text, className)}>
      <span className={cn("flex items-center justify-center bg-primary text-primary-foreground", s.chip)}>
        <svg viewBox="0 0 32 32" className={s.icon} fill="currentColor" aria-hidden="true">
          <path d="M6 5 L26 5 L26 11 L14 11 L14 19 L6 19 Z" />
          <rect x="6" y="13" width="20" height="6" />
          <path d="M26 13 L26 27 L6 27 L6 21 L18 21 L18 13 Z" />
        </svg>
      </span>
      Sprint<span className="gradient-text">ly</span>
    </span>
  );
}
