import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/create", "/open", "/security", "/faq", "/privacy", "/disclaimer"];
  return locales.flatMap((locale) => paths.map((path) => ({
    url: `${site}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  })));
}
