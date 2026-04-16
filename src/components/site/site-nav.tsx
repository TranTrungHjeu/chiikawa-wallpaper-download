"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/mobile", label: "Mobile" },
  { href: "/desktop", label: "Desktop" },
  { href: "/gif", label: "GIF" },
];

export function SiteNav({
  onRouteIntent,
}: {
  onRouteIntent?: (href: string) => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-3 py-3 md:px-8 md:py-4">
      <div className="glass-line mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2.5 shadow-cute md:flex-row md:items-center md:justify-between md:px-4 md:py-3">
        <Link
          href="/"
          prefetch={false}
          onPointerEnter={() => onRouteIntent?.("/")}
          onPointerDown={() => onRouteIntent?.("/")}
          onTouchStart={() => onRouteIntent?.("/")}
          className="flex items-center gap-2.5"
        >
          <Image
            src="/favicon.ico"
            alt={SITE_NAME}
            width={42}
            height={42}
            className="h-9 w-9 object-contain md:h-11 md:w-11"
            priority
          />
          <p className="headline-display text-base leading-none md:text-2xl">{SITE_NAME}</p>
        </Link>

        <nav className="no-scrollbar flex w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto md:w-auto md:justify-end">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                onPointerEnter={() => onRouteIntent?.(item.href)}
                onPointerDown={() => onRouteIntent?.(item.href)}
                onTouchStart={() => onRouteIntent?.(item.href)}
                onFocus={() => onRouteIntent?.(item.href)}
                className={cn(
                  "inline-flex h-9 shrink-0 snap-start items-center justify-center border px-3 text-[13px] font-black tracking-[0.08em] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-10 md:px-4 md:text-sm md:tracking-normal",
                  active
                    ? "border-[var(--color-ink)] bg-[linear-gradient(180deg,#2f3a56,#25304a)] text-white shadow-[0_14px_28px_rgba(37,48,74,0.22)] hover:border-[#1f2740] hover:bg-[linear-gradient(180deg,#3a4768,#1f2740)] hover:text-white"
                    : "border-white/55 text-slate-600 hover:border-[rgba(255,159,178,0.55)] hover:bg-white/88 hover:text-[var(--color-ink)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
