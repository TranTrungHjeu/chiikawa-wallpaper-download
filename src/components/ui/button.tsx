import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[var(--color-ink)] text-white shadow-cute hover:bg-slate-800",
  secondary:
    "bg-white/90 text-[var(--color-ink)] ring-1 ring-slate-200 hover:bg-white",
  blush: "bg-[var(--color-sakura)] text-[var(--color-ink)] hover:bg-[#ff8aa2]",
  ghost:
    "bg-transparent text-[var(--color-ink)] ring-1 ring-slate-200 hover:bg-white/70",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm md:text-base",
  lg: "h-14 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-bold transition hover-lift",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

type LinkButtonClassOptions = {
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function linkButtonClassName({
  className,
  variant = "primary",
  size = "md",
}: LinkButtonClassOptions) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-none font-bold transition hover-lift",
    variants[variant],
    sizes[size],
    className
  );
}
