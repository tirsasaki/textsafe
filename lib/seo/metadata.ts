import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  noIndex = false,
): Metadata {
  const suffix = path ? `/${path}` : "";
  const canonical = `${siteUrl}/${locale}${suffix}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/en${suffix}`,
        id: `${siteUrl}/id${suffix}`,
        "x-default": `${siteUrl}/en${suffix}`,
      },
    },
    robots: noIndex ? { index: false, follow: false, noarchive: true } : undefined,
    openGraph: noIndex ? undefined : { title, description, url: canonical, siteName: "TextSafe", locale: locale === "en" ? "en_US" : "id_ID", type: "website" },
    twitter: noIndex ? undefined : { card: "summary", title, description },
  };
}
