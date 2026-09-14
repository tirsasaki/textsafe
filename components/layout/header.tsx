"use client";

import Link from "next/link";
import { Languages, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  locale: Locale;
  labels: {
    appName: string;
    nav: { create: string; open: string; security: string; faq: string };
    language: string;
    theme: string;
    light: string;
    dark: string;
    menu: string;
    closeMenu: string;
  };
};

export function Header({ locale, labels }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const otherLocale = locale === "en" ? "id" : "en";
  const navigation = [
    [labels.nav.create, `/${locale}/create`],
    [labels.nav.open, `/${locale}/open`],
    [labels.nav.security, `/${locale}/security`],
    [labels.nav.faq, `/${locale}/faq`],
  ] as const;

  function switchLanguage() {
    localStorage.setItem("textsafe-locale", otherLocale);
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/") || `/${otherLocale}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface)] backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href={`/${locale}`} aria-label={labels.appName}><Logo name={labels.appName} /></Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={labels.menu}>
          {navigation.map(([label, href]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={switchLanguage} className="btn-secondary !px-3 !py-2.5" aria-label={labels.language}>
            <Languages size={18} aria-hidden="true" /><span className="text-xs font-extrabold">{otherLocale.toUpperCase()}</span>
          </button>
          <ThemeToggle label={labels.theme} light={labels.light} dark={labels.dark} />
          <button type="button" onClick={() => setOpen((value) => !value)} className="btn-secondary !p-2.5 md:hidden" aria-expanded={open} aria-label={open ? labels.closeMenu : labels.menu}>
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-page grid gap-1 border-t border-[var(--border)] py-3 md:hidden" aria-label={labels.menu}>
          {navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 font-semibold hover:bg-[var(--surface-strong)]">{label}</Link>)}
        </nav>
      )}
    </header>
  );
}
