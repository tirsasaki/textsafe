import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/home/landing";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) return {};
  const m = getMessages(locale).home; return pageMetadata(locale, "", m.metaTitle, m.metaDescription);
}
export default async function HomePage({ params }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <Landing locale={locale} messages={getMessages(locale)} />;
}
