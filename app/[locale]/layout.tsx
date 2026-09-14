import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { isLocale, locales } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  return (
    <div lang={rawLocale} className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--surface-strong)] focus:p-3">{messages.common.skipToContent}</a>
      <Header locale={rawLocale} labels={messages.common} />
      <main id="main-content">{children}</main>
      <Footer locale={rawLocale} labels={messages.common} />
    </div>
  );
}
