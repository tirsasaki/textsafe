import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  labels: {
    appName: string;
    nav: { privacy: string; security: string; disclaimer: string };
    github: string;
    encryptionBrowser: string;
  };
};

export function Footer({ locale, labels }: Props) {
  return (
    <footer className="mt-20 border-t border-[var(--border)]">
      <div className="container-page flex flex-col gap-5 py-8 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <div><p className="font-bold text-[var(--foreground)]">{labels.appName}</p><p>{labels.encryptionBrowser}</p></div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href={`/${locale}/privacy`}>{labels.nav.privacy}</Link>
          <Link href={`/${locale}/security`}>{labels.nav.security}</Link>
          <a href="https://github.com/tirsasaki/textsafe" rel="noreferrer">{labels.github}</a>
          <Link href={`/${locale}/disclaimer`}>{labels.nav.disclaimer}</Link>
        </nav>
        <p>© {new Date().getFullYear()} {labels.appName}</p>
      </div>
    </footer>
  );
}
