import {
  EnvelopeSimple,
  FacebookLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 pt-8 md:px-8 md:pb-8 md:pt-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border border-white/70 bg-white/70 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Tác giả
          </p>
          <p className="headline-display text-2xl text-[var(--color-ink)] md:text-3xl">
            Tran Trung Hieu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://www.facebook.com/xitthui01111/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/80 bg-white/92 text-[var(--color-ink)] transition hover:bg-white md:h-11 md:w-11"
          >
            <FacebookLogo className="h-5 w-5" weight="fill" />
          </a>
          <a
            href="https://www.tiktok.com/@thangchodjen"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/80 bg-white/92 text-[var(--color-ink)] transition hover:bg-white md:h-11 md:w-11"
          >
            <TiktokLogo className="h-5 w-5" weight="fill" />
          </a>
          <a
            href="mailto:trantrunghieu.contact@gmail.com"
            aria-label="Email"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/80 bg-white/92 text-[var(--color-ink)] transition hover:bg-white md:h-11 md:w-11"
          >
            <EnvelopeSimple className="h-5 w-5" weight="fill" />
          </a>
        </div>
      </div>
    </footer>
  );
}
